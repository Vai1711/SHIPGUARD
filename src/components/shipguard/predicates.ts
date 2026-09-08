import type { Invariant } from "./types";

/**
 * Shared invariant-predicate bridge.
 *
 * User-edited contracts are stored as Python-style expressions over the
 * attack execution context (e.g. "post_total == pre_total"). Both the
 * client demo evaluator (this file) and the backend attack synthesizer
 * (backend/synthesizer/attack_synthesizer.py) compile the exact same
 * expression, so a judge's edited formula is genuinely what gets checked.
 *
 * Evaluation is a real compile (tokenizer → shunting-yard → RPN) — never
 * eval/Function construction — so arbitrary code in a formula cannot run.
 */

/** Convenience type for invariants guaranteed to carry a predicate. */
export type InvariantWithExpression = Invariant & { expression?: string };

/** Runtime state captured around the concurrent attack execution. */
export interface AttackContext {
  pre_sender: number;
  pre_receiver: number;
  pre_total: number;
  post_sender: number;
  post_receiver: number;
  post_total: number;
  amount: number;
}

/** Result of checking one invariant expression against the context. */
export interface PredicateResult {
  passed: boolean;
  /** Set when the expression could not be compiled/evaluated. */
  error?: string;
}

type Token =
  | { kind: "num"; value: number }
  | { kind: "ident"; name: string }
  | { kind: "op"; value: string }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "comma" };

/**
 * Canonicalize the notations users actually type (unicode math, prose
 * keywords, currency symbols) into the Python-style expression language.
 */
export function normalizeExpression(raw: string): string {
  let expr = raw.trim();
  // Currency symbols on bare numbers (₹1,000 → 1000).
  expr = expr.replace(/[₹$]/g, "").replace(/(\d),(?=\d{3}\b)/g, "$1");
  // Common shorthand → context names.
  expr = expr.replace(/\bpre_sum\b/g, "pre_total");
  expr = expr.replace(/\bpost_sum\b/g, "post_total");
  expr = expr.replace(/\bsender_pre\b/g, "pre_sender");
  expr = expr.replace(/\bsender_post\b/g, "post_sender");
  expr = expr.replace(/\breceiver_pre\b/g, "pre_receiver");
  expr = expr.replace(/\breceiver_post\b/g, "post_receiver");
  // Prose operators.
  expr = expr.replace(/\bstays?\s+constant\b/gi, "== unchanged");
  expr = expr.replace(/\bis\s+unchanged\b/gi, "== unchanged");
  expr = expr.replace(/\bunchanged\b/g, "pre_total");
  return expr;
}

/** Map Python/unicode operators to their JS equivalents. */
function normalizeOperator(op: string): string {
  switch (op) {
    case "==":
    case "===":
      return "===";
    case "!=":
    case "≠":
    case "!==":
      return "!==";
    case ">=":
    case "≥":
      return ">=";
    case "<=":
    case "≤":
      return "<=";
    case "and":
    case "∧":
      return "&&";
    case "or":
    case "∨":
      return "||";
    case "not":
    case "¬":
      return "!";
    default:
      return op;
  }
}

const OP_PRECEDENCE: Record<string, number> = {
  "||": 1,
  "&&": 2,
  "===": 3,
  "!==": 3,
  ">=": 3,
  "<=": 3,
  ">": 3,
  "<": 3,
  "+": 4,
  "-": 4,
  "*": 5,
  "/": 5,
  "%": 5,
  "!": 6,
};

const COMPARISON_OPS = new Set(["===", "!==", ">=", "<=", ">", "<"]);
const ARITH_OPS = new Set(["+", "-", "*", "/", "%"]);
const LOGIC_OPS = new Set(["&&", "||"]);

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(expr[i + 1] ?? ""))) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j += 1;
      const value = Number.parseFloat(expr.slice(i, j));
      if (Number.isNaN(value)) throw new Error(`bad number at ${i}: "${expr.slice(i, j)}"`);
      tokens.push({ kind: "num", value });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j += 1;
      tokens.push({ kind: "ident", name: expr.slice(i, j) });
      i = j;
      continue;
    }
    const three = expr.slice(i, i + 3);
    const two = expr.slice(i, i + 2);
    const matchedThree =
      three === "===" || three === "!==" || three === "≥=" || three === "≤="
        ? three
        : null;
    if (matchedThree) {
      tokens.push({ kind: "op", value: matchedThree });
      i += 3;
      continue;
    }
    const matchedTwo =
      two === "==" ||
      two === "!=" ||
      two === ">=" ||
      two === "<=" ||
      two === "&&" ||
      two === "||"
        ? two
        : null;
    if (matchedTwo) {
      tokens.push({ kind: "op", value: matchedTwo });
      i += 2;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({ kind: "comma" });
      i += 1;
      continue;
    }
    if ("+-*/%<>!".includes(ch)) {
      tokens.push({ kind: "op", value: ch });
      i += 1;
      continue;
    }
    if ("∧∨¬≠≥≤".includes(ch)) {
      tokens.push({ kind: "op", value: normalizeOperator(ch) });
      i += 1;
      continue;
    }
    throw new Error(`unexpected character "${ch}" at position ${i}`);
  }
  return tokens;
}

/** Shunting-yard: infix tokens → postfix (RPN) tokens. */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | null = null;

  for (const token of tokens) {
    if (token.kind === "num" || token.kind === "ident") {
      output.push(token);
    } else if (token.kind === "op") {
      const op = token.value;
      const unary = op === "!" && (prev === null || (prev.kind === "op" && prev.value !== "!") || prev.kind === "lparen" || prev.kind === "comma");
      if (!unary && prev && prev.kind === "op" && prev.value === "!") {
        // Post-operand "!" is invalid in our grammar; treat as error.
        throw new Error(`unexpected "!" after operand`);
      }
      const prec = OP_PRECEDENCE[op] ?? 0;
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.kind !== "op") break;
        const topPrec = OP_PRECEDENCE[top.value] ?? 0;
        if (topPrec > prec || (topPrec === prec && op !== "!")) {
          output.push(stack.pop() as Token);
        } else break;
      }
      stack.push(token);
    } else if (token.kind === "lparen") {
      stack.push(token);
    } else if (token.kind === "comma") {
      while (stack.length > 0 && stack[stack.length - 1].kind !== "lparen") {
        output.push(stack.pop() as Token);
      }
      if (stack.length === 0) throw new Error("unbalanced comma");
    } else if (token.kind === "rparen") {
      while (stack.length > 0 && stack[stack.length - 1].kind !== "lparen") {
        output.push(stack.pop() as Token);
      }
      if (stack.length === 0) throw new Error("unbalanced parenthesis");
      stack.pop(); // discard lparen
      // Function call: ident immediately before lparen.
      if (stack.length > 0 && stack[stack.length - 1].kind === "ident") {
        output.push(stack.pop() as Token);
      }
    }
    prev = token;
  }

  while (stack.length > 0) {
    const top = stack.pop() as Token;
    if (top.kind === "lparen" || top.kind === "rparen") {
      throw new Error("unbalanced parenthesis");
    }
    output.push(top);
  }
  return output;
}

const SAFE_FUNCTIONS: Record<string, (args: number[]) => number> = {
  abs: (a) => Math.abs(a[0]),
  min: (a) => Math.min(...a),
  max: (a) => Math.max(...a),
  round: (a) => Math.round(a[0]),
};

const CONTEXT_KEYS = new Set([
  "pre_sender",
  "pre_receiver",
  "pre_total",
  "post_sender",
  "post_receiver",
  "post_total",
  "amount",
  "True",
  "False",
]);

function evalRPN(rpn: Token[], context: AttackContext): number | boolean {
  const stack: (number | boolean)[] = [];
  let sawFuncArity = false;

  for (const token of rpn) {
    if (token.kind === "num") {
      stack.push(token.value);
    } else if (token.kind === "ident") {
      if (token.name === "True") stack.push(true);
      else if (token.name === "False") stack.push(false);
      else if (token.name in SAFE_FUNCTIONS) {
        // Markers were pushed by the comma-separated args below.
        const args: number[] = [];
        while (stack.length > 0 && typeof stack[stack.length - 1] === "number") {
          args.unshift(stack.pop() as number);
        }
        if (args.length === 0) throw new Error(`${token.name}() needs arguments`);
        stack.push(SAFE_FUNCTIONS[token.name](args));
        sawFuncArity = true;
      } else if (CONTEXT_KEYS.has(token.name)) {
        stack.push(context[token.name as keyof AttackContext] as number);
      } else {
        throw new Error(`unknown identifier "${token.name}"`);
      }
    } else if (token.kind === "op") {
      if (token.value === "!") {
        const a = stack.pop();
        if (a === undefined) throw new Error("missing operand for not");
        stack.push(!a);
        continue;
      }
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) {
        throw new Error(`missing operand for "${token.value}"`);
      }
      const na = typeof a === "boolean" ? (a ? 1 : 0) : a;
      const nb = typeof b === "boolean" ? (b ? 1 : 0) : b;
      switch (token.value) {
        case "+": stack.push(na + nb); break;
        case "-": stack.push(na - nb); break;
        case "*": stack.push(na * nb); break;
        case "/":
          if (nb === 0) throw new Error("division by zero");
          stack.push(na / nb);
          break;
        case "%":
          if (nb === 0) throw new Error("modulo by zero");
          stack.push(na % nb);
          break;
        case "===": stack.push(na === nb); break;
        case "!==": stack.push(na !== nb); break;
        case ">=": stack.push(na >= nb); break;
        case "<=": stack.push(na <= nb); break;
        case ">": stack.push(na > nb); break;
        case "<": stack.push(na < nb); break;
        case "&&": stack.push(Boolean(a) && Boolean(b)); break;
        case "||": stack.push(Boolean(a) || Boolean(b)); break;
        default: throw new Error(`unsupported operator "${token.value}"`);
      }
    }
    // commas never survive to RPN outside calls
  }
  void sawFuncArity;

  if (stack.length !== 1) throw new Error("malformed expression");
  const result = stack[0];
  return result;
}

/**
 * Compile and evaluate a user invariant expression against the attack
 * context. Python-style syntax (and common unicode math) is accepted;
 * nothing outside the whitelisted identifiers/functions can execute.
 */
export function evaluateInvariant(
  rawExpression: string,
  context: AttackContext
): PredicateResult {
  if (!rawExpression || !rawExpression.trim()) {
    return { passed: false, error: "empty predicate" };
  }
  try {
    const expr = normalizeExpression(rawExpression);
    const tokens = tokenize(expr);
    if (tokens.length === 0) return { passed: false, error: "empty predicate" };
    const rpn = toRPN(tokens);
    const result = evalRPN(rpn, context);
    if (typeof result === "number") {
      // A bare numeric expression is truthy iff non-zero (Python semantics).
      return { passed: result !== 0 };
    }
    return { passed: result };
  } catch (err) {
    return {
      passed: false,
      error: err instanceof Error ? err.message : "invalid predicate",
    };
  }
}

/**
 * Check the full active contract set against a captured context and return
 * the first falsified invariant (gate verdict order), or null if all hold.
 */
export function findFalsifiedInvariant(
  invariants: Invariant[],
  context: AttackContext
): { invariant: Invariant; result: PredicateResult } | null {
  for (const inv of invariants) {
    // Contracts without an expression fall back to the conservation law —
    // the demo attack's canonical falsified property.
    const expression = inv.expression ?? "post_total == pre_total";
    const result = evaluateInvariant(expression, context);
    if (!result.passed) {
      return { invariant: inv, result };
    }
  }
  return null;
}
