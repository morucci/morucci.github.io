// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  countLength() {
    let length5 = 0;
    for (let _ of this)
      length5++;
    return length5;
  }
};
function prepend(element2, tail) {
  return new NonEmpty(element2, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index3) {
    return this.buffer[index3];
  }
  // @internal
  floatAt(index3) {
    return byteArrayToFloat(this.buffer.slice(index3, index3 + 8));
  }
  // @internal
  intFromSlice(start4, end) {
    return byteArrayToInt(this.buffer.slice(start4, end));
  }
  // @internal
  binaryFromSlice(start4, end) {
    return new _BitArray(this.buffer.slice(start4, end));
  }
  // @internal
  sliceAfter(index3) {
    return new _BitArray(this.buffer.slice(index3));
  }
};
var UtfCodepoint = class {
  constructor(value) {
    this.value = value;
  }
};
function byteArrayToInt(byteArray) {
  byteArray = byteArray.reverse();
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}
function byteArrayToFloat(byteArray) {
  return new Float64Array(byteArray.reverse().buffer)[0];
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a2 = values.pop();
    let b = values.pop();
    if (a2 === b)
      continue;
    if (!isObject(a2) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a2, b) || unequalDates(a2, b) || unequalBuffers(a2, b) || unequalArrays(a2, b) || unequalMaps(a2, b) || unequalSets(a2, b) || unequalRegExps(a2, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a2);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a2.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys2, get3] = getters(a2);
    for (let k of keys2(a2)) {
      values.push(get3(a2, k), get3(b, k));
    }
  }
  return true;
}
function getters(object3) {
  if (object3 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object3 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a2, b) {
  return a2 instanceof Date && (a2 > b || a2 < b);
}
function unequalBuffers(a2, b) {
  return a2.buffer instanceof ArrayBuffer && a2.BYTES_PER_ELEMENT && !(a2.byteLength === b.byteLength && a2.every((n, i) => n === b[i]));
}
function unequalArrays(a2, b) {
  return Array.isArray(a2) && a2.length !== b.length;
}
function unequalMaps(a2, b) {
  return a2 instanceof Map && a2.size !== b.size;
}
function unequalSets(a2, b) {
  return a2 instanceof Set && (a2.size != b.size || [...a2].some((e) => !b.has(e)));
}
function unequalRegExps(a2, b) {
  return a2 instanceof RegExp && (a2.source !== b.source || a2.flags !== b.flags);
}
function isObject(a2) {
  return typeof a2 === "object" && a2 !== null;
}
function structurallyCompatibleObjects(a2, b) {
  if (typeof a2 !== "object" && typeof b !== "object" && (!a2 || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a2 instanceof c))
    return false;
  return a2.constructor === b.constructor;
}
function remainderInt(a2, b) {
  if (b === 0) {
    return 0;
  } else {
    return a2 % b;
  }
}
function divideInt(a2, b) {
  return Math.trunc(divideFloat(a2, b));
}
function divideFloat(a2, b) {
  if (b === 0) {
    return 0;
  } else {
    return a2 / b;
  }
}
function makeError(variant, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.module = module;
  error.line = line;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a2 = option[0];
    return new Ok(a2);
  } else {
    return new Error(e);
  }
}
function from_result(result) {
  if (result.isOk()) {
    let a2 = result[0];
    return new Some(a2);
  } else {
    return new None();
  }
}
function unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}
function map(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return new Some(fun(x));
  } else {
    return new None();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/regex.mjs
var Match = class extends CustomType {
  constructor(content, submatches) {
    super();
    this.content = content;
    this.submatches = submatches;
  }
};
var CompileError = class extends CustomType {
  constructor(error, byte_index) {
    super();
    this.error = error;
    this.byte_index = byte_index;
  }
};
var Options = class extends CustomType {
  constructor(case_insensitive, multi_line) {
    super();
    this.case_insensitive = case_insensitive;
    this.multi_line = multi_line;
  }
};
function compile(pattern, options) {
  return compile_regex(pattern, options);
}
function check(regex, content) {
  return regex_check(regex, content);
}
function scan(regex, string3) {
  return regex_scan(regex, string3);
}

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
var Lt = class extends CustomType {
};
var Eq = class extends CustomType {
};
var Gt = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function absolute_value(x) {
  let $ = x >= 0;
  if ($) {
    return x;
  } else {
    return x * -1;
  }
}
function parse(string3) {
  return parse_int(string3);
}
function to_string2(x) {
  return to_string(x);
}
function compare(a2, b) {
  let $ = a2 === b;
  if ($) {
    return new Eq();
  } else {
    let $1 = a2 < b;
    if ($1) {
      return new Lt();
    } else {
      return new Gt();
    }
  }
}
function min(a2, b) {
  let $ = a2 < b;
  if ($) {
    return a2;
  } else {
    return b;
  }
}
function max(a2, b) {
  let $ = a2 > b;
  if ($) {
    return a2;
  } else {
    return b;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/pair.mjs
function second(pair) {
  let a2 = pair[1];
  return a2;
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
var Continue = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Stop = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Ascending = class extends CustomType {
};
var Descending = class extends CustomType {
};
function count_length(loop$list, loop$count) {
  while (true) {
    let list2 = loop$list;
    let count = loop$count;
    if (list2.atLeastLength(1)) {
      let list$1 = list2.tail;
      loop$list = list$1;
      loop$count = count + 1;
    } else {
      return count;
    }
  }
}
function length2(list2) {
  return count_length(list2, 0);
}
function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(xs) {
  return do_reverse(xs, toList([]));
}
function first(list2) {
  if (list2.hasLength(0)) {
    return new Error(void 0);
  } else {
    let x = list2.head;
    return new Ok(x);
  }
}
function do_filter(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list2.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list2.head;
      let xs = list2.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($) {
          return prepend(x, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list2, predicate) {
  return do_filter(list2, predicate, toList([]));
}
function do_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list2.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list2.head;
      let xs = list2.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}
function map2(list2, fun) {
  return do_map(list2, fun, toList([]));
}
function drop(loop$list, loop$n) {
  while (true) {
    let list2 = loop$list;
    let n = loop$n;
    let $ = n <= 0;
    if ($) {
      return list2;
    } else {
      if (list2.hasLength(0)) {
        return toList([]);
      } else {
        let xs = list2.tail;
        loop$list = xs;
        loop$n = n - 1;
      }
    }
  }
}
function do_take(loop$list, loop$n, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let n = loop$n;
    let acc = loop$acc;
    let $ = n <= 0;
    if ($) {
      return reverse(acc);
    } else {
      if (list2.hasLength(0)) {
        return reverse(acc);
      } else {
        let x = list2.head;
        let xs = list2.tail;
        loop$list = xs;
        loop$n = n - 1;
        loop$acc = prepend(x, acc);
      }
    }
  }
}
function take(list2, n) {
  return do_take(list2, n, toList([]));
}
function do_append(loop$first, loop$second) {
  while (true) {
    let first3 = loop$first;
    let second2 = loop$second;
    if (first3.hasLength(0)) {
      return second2;
    } else {
      let item = first3.head;
      let rest$1 = first3.tail;
      loop$first = rest$1;
      loop$second = prepend(item, second2);
    }
  }
}
function append2(first3, second2) {
  return do_append(reverse(first3), second2);
}
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix.hasLength(0)) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function do_concat(loop$lists, loop$acc) {
  while (true) {
    let lists = loop$lists;
    let acc = loop$acc;
    if (lists.hasLength(0)) {
      return reverse(acc);
    } else {
      let list2 = lists.head;
      let further_lists = lists.tail;
      loop$lists = further_lists;
      loop$acc = reverse_and_prepend(list2, acc);
    }
  }
}
function concat(lists) {
  return do_concat(lists, toList([]));
}
function fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list2 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list2.hasLength(0)) {
      return initial;
    } else {
      let x = list2.head;
      let rest$1 = list2.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, x);
      loop$fun = fun;
    }
  }
}
function do_index_fold(loop$over, loop$acc, loop$with, loop$index) {
  while (true) {
    let over = loop$over;
    let acc = loop$acc;
    let with$ = loop$with;
    let index3 = loop$index;
    if (over.hasLength(0)) {
      return acc;
    } else {
      let first$1 = over.head;
      let rest$1 = over.tail;
      loop$over = rest$1;
      loop$acc = with$(acc, first$1, index3);
      loop$with = with$;
      loop$index = index3 + 1;
    }
  }
}
function index_fold(over, initial, fun) {
  return do_index_fold(over, initial, fun, 0);
}
function fold_until(loop$collection, loop$accumulator, loop$fun) {
  while (true) {
    let collection = loop$collection;
    let accumulator = loop$accumulator;
    let fun = loop$fun;
    if (collection.hasLength(0)) {
      return accumulator;
    } else {
      let first$1 = collection.head;
      let rest$1 = collection.tail;
      let $ = fun(accumulator, first$1);
      if ($ instanceof Continue) {
        let next_accumulator = $[0];
        loop$collection = rest$1;
        loop$accumulator = next_accumulator;
        loop$fun = fun;
      } else {
        let b = $[0];
        return b;
      }
    }
  }
}
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let compare4 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list2.hasLength(0)) {
      if (direction instanceof Ascending) {
        return prepend(do_reverse(growing$1, toList([])), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list2.head;
      let rest$1 = list2.tail;
      let $ = compare4(prev, new$1);
      if ($ instanceof Gt && direction instanceof Descending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Lt && direction instanceof Ascending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Eq && direction instanceof Ascending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Gt && direction instanceof Ascending) {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(do_reverse(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next2 = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next2);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next2;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Lt && direction instanceof Descending) {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(do_reverse(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next2 = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next2);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next2;
          loop$acc = acc$1;
        }
      } else {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(do_reverse(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next2 = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next2);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next2;
          loop$acc = acc$1;
        }
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1.hasLength(0)) {
      let list3 = list2;
      return do_reverse(list3, acc);
    } else if (list2.hasLength(0)) {
      let list3 = list1;
      return do_reverse(list3, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first22 = list2.head;
      let rest2 = list2.tail;
      let $ = compare4(first1, first22);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Gt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2.hasLength(0)) {
      return do_reverse(acc, toList([]));
    } else if (sequences2.hasLength(1)) {
      let sequence = sequences2.head;
      return do_reverse(
        prepend(do_reverse(sequence, toList([])), acc),
        toList([])
      );
    } else {
      let ascending1 = sequences2.head;
      let ascending2 = sequences2.tail.head;
      let rest$1 = sequences2.tail.tail;
      let descending = merge_ascendings(
        ascending1,
        ascending2,
        compare4,
        toList([])
      );
      loop$sequences = rest$1;
      loop$compare = compare4;
      loop$acc = prepend(descending, acc);
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1.hasLength(0)) {
      let list3 = list2;
      return do_reverse(list3, acc);
    } else if (list2.hasLength(0)) {
      let list3 = list1;
      return do_reverse(list3, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first22 = list2.head;
      let rest2 = list2.tail;
      let $ = compare4(first1, first22);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      } else if ($ instanceof Gt) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2.hasLength(0)) {
      return do_reverse(acc, toList([]));
    } else if (sequences2.hasLength(1)) {
      let sequence = sequences2.head;
      return do_reverse(
        prepend(do_reverse(sequence, toList([])), acc),
        toList([])
      );
    } else {
      let descending1 = sequences2.head;
      let descending2 = sequences2.tail.head;
      let rest$1 = sequences2.tail.tail;
      let ascending = merge_descendings(
        descending1,
        descending2,
        compare4,
        toList([])
      );
      loop$sequences = rest$1;
      loop$compare = compare4;
      loop$acc = prepend(ascending, acc);
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences2 = loop$sequences;
    let direction = loop$direction;
    let compare4 = loop$compare;
    if (sequences2.hasLength(0)) {
      return toList([]);
    } else if (sequences2.hasLength(1) && direction instanceof Ascending) {
      let sequence = sequences2.head;
      return sequence;
    } else if (sequences2.hasLength(1) && direction instanceof Descending) {
      let sequence = sequences2.head;
      return do_reverse(sequence, toList([]));
    } else if (direction instanceof Ascending) {
      let sequences$1 = merge_ascending_pairs(sequences2, compare4, toList([]));
      loop$sequences = sequences$1;
      loop$direction = new Descending();
      loop$compare = compare4;
    } else {
      let sequences$1 = merge_descending_pairs(sequences2, compare4, toList([]));
      loop$sequences = sequences$1;
      loop$direction = new Ascending();
      loop$compare = compare4;
    }
  }
}
function sort(list2, compare4) {
  if (list2.hasLength(0)) {
    return toList([]);
  } else if (list2.hasLength(1)) {
    let x = list2.head;
    return toList([x]);
  } else {
    let x = list2.head;
    let y = list2.tail.head;
    let rest$1 = list2.tail.tail;
    let direction = (() => {
      let $ = compare4(x, y);
      if ($ instanceof Lt) {
        return new Ascending();
      } else if ($ instanceof Eq) {
        return new Ascending();
      } else {
        return new Descending();
      }
    })();
    let sequences$1 = sequences(
      rest$1,
      compare4,
      toList([x]),
      direction,
      y,
      toList([])
    );
    return merge_all(sequences$1, new Ascending(), compare4);
  }
}
function do_repeat(loop$a, loop$times, loop$acc) {
  while (true) {
    let a2 = loop$a;
    let times = loop$times;
    let acc = loop$acc;
    let $ = times <= 0;
    if ($) {
      return acc;
    } else {
      loop$a = a2;
      loop$times = times - 1;
      loop$acc = prepend(a2, acc);
    }
  }
}
function repeat2(a2, times) {
  return do_repeat(a2, times, toList([]));
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function is_ok(result) {
  if (!result.isOk()) {
    return false;
  } else {
    return true;
  }
}
function map3(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
function try$(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return fun(x);
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function then$(result, fun) {
  return try$(result, fun);
}
function unwrap2(result, default$) {
  if (result.isOk()) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}
function nil_error(result) {
  return map_error(result, (_) => {
    return void 0;
  });
}

// build/dev/javascript/gleam_stdlib/gleam/string_builder.mjs
function from_strings(strings) {
  return concat2(strings);
}
function from_string(string3) {
  return identity(string3);
}
function to_string3(builder) {
  return identity(builder);
}
function split2(iodata, pattern) {
  return split(iodata, pattern);
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path2) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path2;
  }
};
function from(a2) {
  return identity(a2);
}
function classify(data) {
  return classify_dynamic(data);
}
function int(data) {
  return decode_int(data);
}
function optional(decode3) {
  return (value) => {
    return decode_option(value, decode3);
  };
}
function any(decoders) {
  return (data) => {
    if (decoders.hasLength(0)) {
      return new Error(
        toList([new DecodeError("another type", classify(data), toList([]))])
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($.isOk()) {
        let decoded = $[0];
        return new Ok(decoded);
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}
function all_errors(result) {
  if (result.isOk()) {
    return toList([]);
  } else {
    let errors = result[0];
    return errors;
  }
}
function push_path(error, name) {
  let name$1 = from(name);
  let decoder = any(
    toList([string, (x) => {
      return map3(int(x), to_string2);
    }])
  );
  let name$2 = (() => {
    let $ = decoder(name$1);
    if ($.isOk()) {
      let name$22 = $[0];
      return name$22;
    } else {
      let _pipe = toList(["<", classify(name$1), ">"]);
      let _pipe$1 = from_strings(_pipe);
      return to_string3(_pipe$1);
    }
  })();
  return error.withFields({ path: prepend(name$2, error.path) });
}
function map_errors(result, f) {
  return map_error(
    result,
    (_capture) => {
      return map2(_capture, f);
    }
  );
}
function string(data) {
  return decode_string(data);
}
function field(name, inner_type) {
  return (value) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return try$(
      decode_field(value, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => {
            return push_path(_capture, name);
          }
        );
      }
    );
  };
}
function decode4(constructor, t1, t2, t3, t4) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    if ($.isOk() && $1.isOk() && $2.isOk() && $3.isOk()) {
      let a2 = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      return new Ok(constructor(a2, b, c, d));
    } else {
      let a2 = $;
      let b = $1;
      let c = $2;
      let d = $3;
      return new Error(
        concat(
          toList([all_errors(a2), all_errors(b), all_errors(c), all_errors(d)])
        )
      );
    }
  };
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a2, b) {
  return a2 ^ b + 2654435769 + (a2 << 6) + (a2 >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root2, shift, hash, key, val, addedLeaf) {
  switch (root2.type) {
    case ARRAY_NODE:
      return assocArray(root2, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root2, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root2, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root2, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size + 1,
      array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: ARRAY_NODE,
        size: root2.size,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root2;
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function assocIndex(root2, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root2.bitmap, bit);
  if ((root2.bitmap & bit) !== 0) {
    const node = root2.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root2.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root2.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root2.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root2.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root2, shift, hash, key, val, addedLeaf) {
  if (hash === root2.hash) {
    const idx = collisionIndexOf(root2, key);
    if (idx !== -1) {
      const entry = root2.array[idx];
      if (entry.v === val) {
        return root2;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root2.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root2.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root2.hash, shift),
      array: [root2]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root2, key) {
  const size = root2.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root2.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return findArray(root2, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root2, key);
  }
}
function findArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return void 0;
  }
  return root2.array[idx];
}
function without(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return withoutArray(root2, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root2, key);
  }
}
function withoutArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return root2;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root2;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
  }
  if (n === void 0) {
    if (root2.size <= MIN_ARRAY_NODE) {
      const arr = root2.array;
      const out = new Array(root2.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root2.size - 1,
      array: cloneAndSet(root2.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function withoutIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return root2;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  return root2;
}
function withoutCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return root2;
  }
  if (root2.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root2.hash,
    array: spliceOut(root2.array, idx)
  };
}
function forEach(root2, fn) {
  if (root2 === void 0) {
    return;
  }
  const items = root2.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root2, size) {
    this.root = root2;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root2 = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root2, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
};

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function parse_int(value) {
  if (/^[-+]?(\d+)$/.test(value)) {
    return new Ok(parseInt(value));
  } else {
    return new Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
function string_length(string3) {
  if (string3 === "") {
    return 0;
  }
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    let i = 0;
    for (const _ of iterator) {
      i++;
    }
    return i;
  } else {
    return string3.match(/./gsu).length;
  }
}
function graphemes(string3) {
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    return List.fromArray(Array.from(iterator).map((item) => item.segment));
  } else {
    return List.fromArray(string3.match(/./gsu));
  }
}
function graphemes_iterator(string3) {
  if (Intl && Intl.Segmenter) {
    return new Intl.Segmenter().segment(string3)[Symbol.iterator]();
  }
}
function pop_grapheme(string3) {
  let first3;
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    first3 = iterator.next().value?.segment;
  } else {
    first3 = string3.match(/./su)?.[0];
  }
  if (first3) {
    return new Ok([first3, string3.slice(first3.length)]);
  } else {
    return new Error(Nil);
  }
}
function lowercase(string3) {
  return string3.toLowerCase();
}
function split(xs, pattern) {
  return List.fromArray(xs.split(pattern));
}
function join(xs, separator) {
  const iterator = xs[Symbol.iterator]();
  let result = iterator.next().value || "";
  let current = iterator.next();
  while (!current.done) {
    result = result + separator + current.value;
    current = iterator.next();
  }
  return result;
}
function concat2(xs) {
  let result = "";
  for (const x of xs) {
    result = result + x;
  }
  return result;
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join();
var left_trim_regex = new RegExp(`^([${unicode_whitespaces}]*)`, "g");
var right_trim_regex = new RegExp(`([${unicode_whitespaces}]*)$`, "g");
function print_debug(string3) {
  if (typeof process === "object" && process.stderr?.write) {
    process.stderr.write(string3 + "\n");
  } else if (typeof Deno === "object") {
    Deno.stderr.writeSync(new TextEncoder().encode(string3 + "\n"));
  } else {
    console.log(string3);
  }
}
function regex_check(regex, string3) {
  regex.lastIndex = 0;
  return regex.test(string3);
}
function compile_regex(pattern, options) {
  try {
    let flags = "gu";
    if (options.case_insensitive)
      flags += "i";
    if (options.multi_line)
      flags += "m";
    return new Ok(new RegExp(pattern, flags));
  } catch (error) {
    const number = (error.columnNumber || 0) | 0;
    return new Error(new CompileError(error.message, number));
  }
}
function regex_scan(regex, string3) {
  const matches = Array.from(string3.matchAll(regex)).map((match) => {
    const content = match[0];
    const submatches = [];
    for (let n = match.length - 1; n > 0; n--) {
      if (match[n]) {
        submatches[n - 1] = new Some(match[n]);
        continue;
      }
      if (submatches.length > 0) {
        submatches[n - 1] = new None();
      }
    }
    return new Match(content, List.fromArray(submatches));
  });
  return List.fromArray(matches);
}
function new_map() {
  return Dict.new();
}
function map_get(map7, key) {
  const value = map7.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}
function map_insert(key, value, map7) {
  return map7.set(key, value);
}
function classify_dynamic(data) {
  if (typeof data === "string") {
    return "String";
  } else if (typeof data === "boolean") {
    return "Bool";
  } else if (data instanceof Result) {
    return "Result";
  } else if (data instanceof List) {
    return "List";
  } else if (data instanceof BitArray) {
    return "BitArray";
  } else if (data instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data)) {
    return "Int";
  } else if (Array.isArray(data)) {
    return `Tuple of ${data.length} elements`;
  } else if (typeof data === "number") {
    return "Float";
  } else if (data === null) {
    return "Null";
  } else if (data === void 0) {
    return "Nil";
  } else {
    const type = typeof data;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function decoder_error(expected, got) {
  return decoder_error_no_classify(expected, classify_dynamic(got));
}
function decoder_error_no_classify(expected, got) {
  return new Error(
    List.fromArray([new DecodeError(expected, got, List.fromArray([]))])
  );
}
function decode_string(data) {
  return typeof data === "string" ? new Ok(data) : decoder_error("String", data);
}
function decode_int(data) {
  return Number.isInteger(data) ? new Ok(data) : decoder_error("Int", data);
}
function decode_option(data, decoder) {
  if (data === null || data === void 0 || data instanceof None)
    return new Ok(new None());
  if (data instanceof Some)
    data = data[0];
  const result = decoder(data);
  if (result.isOk()) {
    return new Ok(new Some(result[0]));
  } else {
    return result;
  }
}
function decode_field(value, name) {
  const not_a_map_error = () => decoder_error("Dict", value);
  if (value instanceof Dict || value instanceof WeakMap || value instanceof Map) {
    const entry = map_get(value, name);
    return new Ok(entry.isOk() ? new Some(entry[0]) : new None());
  } else if (value === null) {
    return not_a_map_error();
  } else if (Object.getPrototypeOf(value) == Object.prototype) {
    return try_get_field(value, name, () => new Ok(new None()));
  } else {
    return try_get_field(value, name, not_a_map_error);
  }
}
function try_get_field(value, field3, or_else) {
  try {
    return field3 in value ? new Ok(new Some(value[field3])) : or_else();
  } catch {
    return or_else();
  }
}
function inspect(v) {
  const t = typeof v;
  if (v === true)
    return "True";
  if (v === false)
    return "False";
  if (v === null)
    return "//js(null)";
  if (v === void 0)
    return "Nil";
  if (t === "string")
    return inspectString(v);
  if (t === "bigint" || t === "number")
    return v.toString();
  if (Array.isArray(v))
    return `#(${v.map(inspect).join(", ")})`;
  if (v instanceof List)
    return inspectList(v);
  if (v instanceof UtfCodepoint)
    return inspectUtfCodepoint(v);
  if (v instanceof BitArray)
    return inspectBitArray(v);
  if (v instanceof CustomType)
    return inspectCustomType(v);
  if (v instanceof Dict)
    return inspectDict(v);
  if (v instanceof Set)
    return `//js(Set(${[...v].map(inspect).join(", ")}))`;
  if (v instanceof RegExp)
    return `//js(${v})`;
  if (v instanceof Date)
    return `//js(Date("${v.toISOString()}"))`;
  if (v instanceof Function) {
    const args = [];
    for (const i of Array(v.length).keys())
      args.push(String.fromCharCode(i + 97));
    return `//fn(${args.join(", ")}) { ... }`;
  }
  return inspectObject(v);
}
function inspectString(str) {
  let new_str = '"';
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    switch (char) {
      case "\n":
        new_str += "\\n";
        break;
      case "\r":
        new_str += "\\r";
        break;
      case "	":
        new_str += "\\t";
        break;
      case "\f":
        new_str += "\\f";
        break;
      case "\\":
        new_str += "\\\\";
        break;
      case '"':
        new_str += '\\"';
        break;
      default:
        if (char < " " || char > "~" && char < "\xA0") {
          new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
        } else {
          new_str += char;
        }
    }
  }
  new_str += '"';
  return new_str;
}
function inspectDict(map7) {
  let body = "dict.from_list([";
  let first3 = true;
  map7.forEach((value, key) => {
    if (!first3)
      body = body + ", ";
    body = body + "#(" + inspect(key) + ", " + inspect(value) + ")";
    first3 = false;
  });
  return body + "])";
}
function inspectObject(v) {
  const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
  const props = [];
  for (const k of Object.keys(v)) {
    props.push(`${inspect(k)}: ${inspect(v[k])}`);
  }
  const body = props.length ? " " + props.join(", ") + " " : "";
  const head = name === "Object" ? "" : name + " ";
  return `//js(${head}{${body}})`;
}
function inspectCustomType(record) {
  const props = Object.keys(record).map((label) => {
    const value = inspect(record[label]);
    return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
  }).join(", ");
  return props ? `${record.constructor.name}(${props})` : record.constructor.name;
}
function inspectList(list2) {
  return `[${list2.toArray().map(inspect).join(", ")}]`;
}
function inspectBitArray(bits) {
  return `<<${Array.from(bits.buffer).join(", ")}>>`;
}
function inspectUtfCodepoint(codepoint2) {
  return `//utfcodepoint(${String.fromCodePoint(codepoint2.value)})`;
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function new$() {
  return new_map();
}
function get(from3, get3) {
  return map_get(from3, get3);
}
function insert(dict, key, value) {
  return map_insert(key, value, dict);
}

// build/dev/javascript/gleam_stdlib/gleam/iterator.mjs
var Stop2 = class extends CustomType {
};
var Continue2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Iterator = class extends CustomType {
  constructor(continuation) {
    super();
    this.continuation = continuation;
  }
};
var Next = class extends CustomType {
  constructor(element2, accumulator) {
    super();
    this.element = element2;
    this.accumulator = accumulator;
  }
};
function stop() {
  return new Stop2();
}
function do_unfold(initial, f) {
  return () => {
    let $ = f(initial);
    if ($ instanceof Next) {
      let x = $.element;
      let acc = $.accumulator;
      return new Continue2(x, do_unfold(acc, f));
    } else {
      return new Stop2();
    }
  };
}
function unfold(initial, f) {
  let _pipe = initial;
  let _pipe$1 = do_unfold(_pipe, f);
  return new Iterator(_pipe$1);
}
function repeatedly(f) {
  return unfold(void 0, (_) => {
    return new Next(f(), void 0);
  });
}
function repeat3(x) {
  return repeatedly(() => {
    return x;
  });
}
function do_fold(loop$continuation, loop$f, loop$accumulator) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let accumulator = loop$accumulator;
    let $ = continuation();
    if ($ instanceof Continue2) {
      let elem = $[0];
      let next2 = $[1];
      loop$continuation = next2;
      loop$f = f;
      loop$accumulator = f(accumulator, elem);
    } else {
      return accumulator;
    }
  }
}
function fold2(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_fold(_pipe, f, initial);
}
function to_list(iterator) {
  let _pipe = iterator;
  let _pipe$1 = fold2(
    _pipe,
    toList([]),
    (acc, e) => {
      return prepend(e, acc);
    }
  );
  return reverse(_pipe$1);
}
function do_take2(continuation, desired) {
  return () => {
    let $ = desired > 0;
    if (!$) {
      return new Stop2();
    } else {
      let $1 = continuation();
      if ($1 instanceof Stop2) {
        return new Stop2();
      } else {
        let e = $1[0];
        let next2 = $1[1];
        return new Continue2(e, do_take2(next2, desired - 1));
      }
    }
  };
}
function take2(iterator, desired) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_take2(_pipe, desired);
  return new Iterator(_pipe$1);
}
function do_append2(first3, second2) {
  let $ = first3();
  if ($ instanceof Continue2) {
    let e = $[0];
    let first$1 = $[1];
    return new Continue2(e, () => {
      return do_append2(first$1, second2);
    });
  } else {
    return second2();
  }
}
function append3(first3, second2) {
  let _pipe = () => {
    return do_append2(first3.continuation, second2.continuation);
  };
  return new Iterator(_pipe);
}
function once(f) {
  let _pipe = () => {
    return new Continue2(f(), stop);
  };
  return new Iterator(_pipe);
}
function single(elem) {
  return once(() => {
    return elem;
  });
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function length3(string3) {
  return string_length(string3);
}
function lowercase2(string3) {
  return lowercase(string3);
}
function starts_with2(string3, prefix) {
  return starts_with(string3, prefix);
}
function concat3(strings) {
  let _pipe = strings;
  let _pipe$1 = from_strings(_pipe);
  return to_string3(_pipe$1);
}
function join2(strings, separator) {
  return join(strings, separator);
}
function pop_grapheme2(string3) {
  return pop_grapheme(string3);
}
function do_slice(string3, idx, len) {
  let _pipe = string3;
  let _pipe$1 = graphemes(_pipe);
  let _pipe$2 = drop(_pipe$1, idx);
  let _pipe$3 = take(_pipe$2, len);
  return concat3(_pipe$3);
}
function slice(string3, idx, len) {
  let $ = len < 0;
  if ($) {
    return "";
  } else {
    let $1 = idx < 0;
    if ($1) {
      let translated_idx = length3(string3) + idx;
      let $2 = translated_idx < 0;
      if ($2) {
        return "";
      } else {
        return do_slice(string3, translated_idx, len);
      }
    } else {
      return do_slice(string3, idx, len);
    }
  }
}
function split3(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = from_string(_pipe);
    let _pipe$2 = split2(_pipe$1, substring);
    return map2(_pipe$2, to_string3);
  }
}
function padding(size, pad_string) {
  let pad_length = length3(pad_string);
  let num_pads = divideInt(size, pad_length);
  let extra = remainderInt(size, pad_length);
  let _pipe = repeat3(pad_string);
  let _pipe$1 = take2(_pipe, num_pads);
  return append3(
    _pipe$1,
    single(slice(pad_string, 0, extra))
  );
}
function pad_left(string3, desired_length, pad_string) {
  let current_length = length3(string3);
  let to_pad_length = desired_length - current_length;
  let _pipe = padding(to_pad_length, pad_string);
  let _pipe$1 = append3(_pipe, single(string3));
  let _pipe$2 = to_list(_pipe$1);
  return concat3(_pipe$2);
}
function inspect2(term) {
  let _pipe = inspect(term);
  return to_string3(_pipe);
}

// build/dev/javascript/gleam_stdlib/gleam/io.mjs
function debug(term) {
  let _pipe = term;
  let _pipe$1 = inspect2(_pipe);
  print_debug(_pipe$1);
  return term;
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function to_int(bool2) {
  if (!bool2) {
    return 0;
  } else {
    return 1;
  }
}
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_json/gleam_json_ffi.mjs
function decode(string3) {
  try {
    const result = JSON.parse(string3);
    return new Ok(result);
  } catch (err) {
    return new Error(getJsonDecodeError(err, string3));
  }
}
function getJsonDecodeError(stdErr, json) {
  if (isUnexpectedEndOfInput(stdErr))
    return new UnexpectedEndOfInput();
  return toUnexpectedByteError(stdErr, json);
}
function isUnexpectedEndOfInput(err) {
  const unexpectedEndOfInputRegex = /((unexpected (end|eof))|(end of data)|(unterminated string)|(json( parse error|\.parse)\: expected '(\:|\}|\])'))/i;
  return unexpectedEndOfInputRegex.test(err.message);
}
function toUnexpectedByteError(err, json) {
  let converters = [
    v8UnexpectedByteError,
    oldV8UnexpectedByteError,
    jsCoreUnexpectedByteError,
    spidermonkeyUnexpectedByteError
  ];
  for (let converter of converters) {
    let result = converter(err, json);
    if (result)
      return result;
  }
  return new UnexpectedByte("", 0);
}
function v8UnexpectedByteError(err) {
  const regex = /unexpected token '(.)', ".+" is not valid JSON/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return new UnexpectedByte(byte, -1);
}
function oldV8UnexpectedByteError(err) {
  const regex = /unexpected token (.) in JSON at position (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  const position = Number(match[2]);
  return new UnexpectedByte(byte, position);
}
function spidermonkeyUnexpectedByteError(err, json) {
  const regex = /(unexpected character|expected .*) at line (\d+) column (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const line = Number(match[2]);
  const column = Number(match[3]);
  const position = getPositionFromMultiline(line, column, json);
  const byte = toHex(json[position]);
  return new UnexpectedByte(byte, position);
}
function jsCoreUnexpectedByteError(err) {
  const regex = /unexpected (identifier|token) "(.)"/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[2]);
  return new UnexpectedByte(byte, 0);
}
function toHex(char) {
  return "0x" + char.charCodeAt(0).toString(16).toUpperCase();
}
function getPositionFromMultiline(line, column, string3) {
  if (line === 1)
    return column - 1;
  let currentLn = 1;
  let position = 0;
  string3.split("").find((char, idx) => {
    if (char === "\n")
      currentLn += 1;
    if (currentLn === line) {
      position = idx + column;
      return true;
    }
    return false;
  });
  return position;
}

// build/dev/javascript/gleam_json/gleam/json.mjs
var UnexpectedEndOfInput = class extends CustomType {
};
var UnexpectedByte = class extends CustomType {
  constructor(byte, position) {
    super();
    this.byte = byte;
    this.position = position;
  }
};
var UnexpectedFormat = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function do_decode(json, decoder) {
  return then$(
    decode(json),
    (dynamic_value) => {
      let _pipe = decoder(dynamic_value);
      return map_error(
        _pipe,
        (var0) => {
          return new UnexpectedFormat(var0);
        }
      );
    }
  );
}
function decode2(json, decoder) {
  return do_decode(json, decoder);
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(all) {
    super();
    this.all = all;
  }
};
function from2(effect) {
  return new Effect(toList([(dispatch, _) => {
    return effect(dispatch);
  }]));
}
function none() {
  return new Effect(toList([]));
}
function batch(effects) {
  return new Effect(
    fold(
      effects,
      toList([]),
      (b, _use1) => {
        let a2 = _use1.all;
        return append2(b, a2);
      }
    )
  );
}

// build/dev/javascript/lustre/lustre/internals/vdom.mjs
var Text = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Element = class extends CustomType {
  constructor(key, namespace2, tag, attrs, children, self_closing, void$) {
    super();
    this.key = key;
    this.namespace = namespace2;
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Attribute = class extends CustomType {
  constructor(x0, x1, as_property) {
    super();
    this[0] = x0;
    this[1] = x1;
    this.as_property = as_property;
  }
};

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute(name, value) {
  return new Attribute(name, from(value), false);
}
function class$(name) {
  return attribute("class", name);
}
function href(uri) {
  return attribute("href", uri);
}
function src(uri) {
  return attribute("src", uri);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element(tag, attrs, children) {
  if (tag === "area") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "base") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "br") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "col") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "embed") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "hr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "img") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "input") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "link") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "meta") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "param") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "source") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "track") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "wbr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else {
    return new Element("", "", tag, attrs, children, false, false);
  }
}
function namespaced(namespace2, tag, attrs, children) {
  return new Element("", namespace2, tag, attrs, children, false, false);
}
function text(content) {
  return new Text(content);
}
function none2() {
  return new Text("");
}

// build/dev/javascript/gleam_stdlib/gleam/set.mjs
var Set2 = class extends CustomType {
  constructor(dict) {
    super();
    this.dict = dict;
  }
};
function contains(set, member) {
  let _pipe = set.dict;
  let _pipe$1 = get(_pipe, member);
  return is_ok(_pipe$1);
}
var token = void 0;
function from_list2(members) {
  let dict = fold(
    members,
    new$(),
    (m, k) => {
      return insert(m, k, token);
    }
  );
  return new Set2(dict);
}

// build/dev/javascript/lustre/lustre/internals/runtime.mjs
var Debug = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Dispatch = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Shutdown = class extends CustomType {
};
var ForceModel = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};

// build/dev/javascript/lustre/vdom.ffi.mjs
function morph(prev, next2, dispatch, isComponent = false) {
  let out;
  let stack = [{ prev, next: next2, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next3, parent } = stack.pop();
    if (next3.subtree !== void 0)
      next3 = next3.subtree();
    if (next3.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next3.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next3.content)
          prev2.textContent = next3.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next3.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next3.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next3,
        dispatch,
        stack,
        isComponent
      });
      if (!prev2) {
        parent.appendChild(created);
      } else if (prev2 !== created) {
        parent.replaceChild(created, prev2);
      }
      out ??= created;
    } else if (next3.elements !== void 0) {
      iterateElement(next3, (fragmentElement) => {
        stack.unshift({ prev: prev2, next: fragmentElement, parent });
        prev2 = prev2?.nextSibling;
      });
    } else if (next3.subtree !== void 0) {
      stack.push({ prev: prev2, next: next3, parent });
    }
  }
  return out;
}
function createElementNode({ prev, next: next2, dispatch, stack }) {
  const namespace2 = next2.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next2.tag && prev.namespaceURI === (next2.namespace || "http://www.w3.org/1999/xhtml");
  const el2 = canMorph ? prev : namespace2 ? document.createElementNS(namespace2, next2.tag) : document.createElement(next2.tag);
  let handlersForEl;
  if (!registeredHandlers.has(el2)) {
    const emptyHandlers = /* @__PURE__ */ new Map();
    registeredHandlers.set(el2, emptyHandlers);
    handlersForEl = emptyHandlers;
  } else {
    handlersForEl = registeredHandlers.get(el2);
  }
  const prevHandlers = canMorph ? new Set(handlersForEl.keys()) : null;
  const prevAttributes = canMorph ? new Set(Array.from(prev.attributes, (a2) => a2.name)) : null;
  let className = null;
  let style = null;
  let innerHTML = null;
  for (const attr of next2.attrs) {
    const name = attr[0];
    const value = attr[1];
    if (attr.as_property) {
      if (el2[name] !== value)
        el2[name] = value;
      if (canMorph)
        prevAttributes.delete(name);
    } else if (name.startsWith("on")) {
      const eventName = name.slice(2);
      const callback = dispatch(value);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      if (canMorph)
        prevHandlers.delete(eventName);
    } else if (name.startsWith("data-lustre-on-")) {
      const eventName = name.slice(15);
      const callback = dispatch(lustreServerEventHandler);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      el2.setAttribute(name, value);
    } else if (name === "class") {
      className = className === null ? value : className + " " + value;
    } else if (name === "style") {
      style = style === null ? value : style + value;
    } else if (name === "dangerous-unescaped-html") {
      innerHTML = value;
    } else {
      if (el2.getAttribute(name) !== value)
        el2.setAttribute(name, value);
      if (name === "value" || name === "selected")
        el2[name] = value;
      if (canMorph)
        prevAttributes.delete(name);
    }
  }
  if (className !== null) {
    el2.setAttribute("class", className);
    if (canMorph)
      prevAttributes.delete("class");
  }
  if (style !== null) {
    el2.setAttribute("style", style);
    if (canMorph)
      prevAttributes.delete("style");
  }
  if (canMorph) {
    for (const attr of prevAttributes) {
      el2.removeAttribute(attr);
    }
    for (const eventName of prevHandlers) {
      handlersForEl.delete(eventName);
      el2.removeEventListener(eventName, lustreGenericEventHandler);
    }
  }
  if (next2.key !== void 0 && next2.key !== "") {
    el2.setAttribute("data-lustre-key", next2.key);
  } else if (innerHTML !== null) {
    el2.innerHTML = innerHTML;
    return el2;
  }
  let prevChild = el2.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = next2.children[Symbol.iterator]().next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next2);
  }
  for (const child of next2.children) {
    iterateElement(child, (currElement) => {
      if (currElement.key !== void 0 && seenKeys !== null) {
        prevChild = diffKeyedChild(
          prevChild,
          currElement,
          el2,
          stack,
          incomingKeyedChildren,
          keyedChildren,
          seenKeys
        );
      } else {
        stack.unshift({ prev: prevChild, next: currElement, parent: el2 });
        prevChild = prevChild?.nextSibling;
      }
    });
  }
  while (prevChild) {
    const next3 = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = next3;
  }
  return el2;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event) {
  const target = event.currentTarget;
  if (!registeredHandlers.has(target)) {
    target.removeEventListener(event.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target);
  if (!handlersForEventTarget.has(event.type)) {
    target.removeEventListener(event.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event.type)(event);
}
function lustreServerEventHandler(event) {
  const el2 = event.currentTarget;
  const tag = el2.getAttribute(`data-lustre-on-${event.type}`);
  const data = JSON.parse(el2.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el2.getAttribute("data-lustre-include") || "[]");
  switch (event.type) {
    case "input":
    case "change":
      include.push("target.value");
      break;
  }
  return {
    tag,
    data: include.reduce(
      (data2, property) => {
        const path2 = property.split(".");
        for (let i = 0, o = data2, e = event; i < path2.length; i++) {
          if (i === path2.length - 1) {
            o[path2[i]] = e[path2[i]];
          } else {
            o[path2[i]] ??= {};
            e = e[path2[i]];
            o = o[path2[i]];
          }
        }
        return data2;
      },
      { data }
    )
  };
}
function getKeyedChildren(el2) {
  const keyedChildren = /* @__PURE__ */ new Map();
  if (el2) {
    for (const child of el2.children) {
      iterateElement(child, (currElement) => {
        const key = currElement?.key || currElement?.getAttribute?.("data-lustre-key");
        if (key)
          keyedChildren.set(key, currElement);
      });
    }
  }
  return keyedChildren;
}
function diffKeyedChild(prevChild, child, el2, stack, incomingKeyedChildren, keyedChildren, seenKeys) {
  while (prevChild && !incomingKeyedChildren.has(prevChild.getAttribute("data-lustre-key"))) {
    const nextChild = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = nextChild;
  }
  if (keyedChildren.size === 0) {
    iterateElement(child, (currChild) => {
      stack.unshift({ prev: prevChild, next: currChild, parent: el2 });
      prevChild = prevChild?.nextSibling;
    });
    return prevChild;
  }
  if (seenKeys.has(child.key)) {
    console.warn(`Duplicate key found in Lustre vnode: ${child.key}`);
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  seenKeys.add(child.key);
  const keyedChild = keyedChildren.get(child.key);
  if (!keyedChild && !prevChild) {
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild && prevChild !== null) {
    const placeholder = document.createTextNode("");
    el2.insertBefore(placeholder, prevChild);
    stack.unshift({ prev: placeholder, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild || keyedChild === prevChild) {
    stack.unshift({ prev: prevChild, next: child, parent: el2 });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  el2.insertBefore(keyedChild, prevChild);
  stack.unshift({ prev: keyedChild, next: child, parent: el2 });
  return prevChild;
}
function iterateElement(element2, processElement) {
  if (element2.elements !== void 0) {
    for (const currElement of element2.elements) {
      processElement(currElement);
    }
  } else {
    processElement(element2);
  }
}

// build/dev/javascript/lustre/client-runtime.ffi.mjs
var LustreClientApplication2 = class _LustreClientApplication {
  #root = null;
  #queue = [];
  #effects = [];
  #didUpdate = false;
  #isComponent = false;
  #model = null;
  #update = null;
  #view = null;
  static start(flags, selector, init4, update2, view2) {
    if (!is_browser())
      return new Error(new NotABrowser());
    const root2 = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root2)
      return new Error(new ElementNotFound(selector));
    const app = new _LustreClientApplication(init4(flags), update2, view2, root2);
    return new Ok((msg) => app.send(msg));
  }
  constructor([model, effects], update2, view2, root2 = document.body, isComponent = false) {
    this.#model = model;
    this.#update = update2;
    this.#view = view2;
    this.#root = root2;
    this.#effects = effects.all.toArray();
    this.#didUpdate = true;
    this.#isComponent = isComponent;
    window.requestAnimationFrame(() => this.#tick());
  }
  send(action) {
    switch (true) {
      case action instanceof Dispatch: {
        this.#queue.push(action[0]);
        this.#tick();
        return;
      }
      case action instanceof Shutdown: {
        this.#shutdown();
        return;
      }
      case action instanceof Debug: {
        this.#debug(action[0]);
        return;
      }
      default:
        return;
    }
  }
  emit(event, data) {
    this.#root.dispatchEvent(
      new CustomEvent(event, {
        bubbles: true,
        detail: data,
        composed: true
      })
    );
  }
  #tick() {
    this.#flush_queue();
    if (this.#didUpdate) {
      const vdom = this.#view(this.#model);
      const dispatch = (handler) => (e) => {
        const result = handler(e);
        if (result instanceof Ok) {
          this.send(new Dispatch(result[0]));
        }
      };
      this.#didUpdate = false;
      this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
    }
  }
  #flush_queue(iterations = 0) {
    while (this.#queue.length) {
      const [next2, effects] = this.#update(this.#model, this.#queue.shift());
      this.#didUpdate ||= this.#model !== next2;
      this.#model = next2;
      this.#effects = this.#effects.concat(effects.all.toArray());
    }
    while (this.#effects.length) {
      this.#effects.shift()(
        (msg) => this.send(new Dispatch(msg)),
        (event, data) => this.emit(event, data)
      );
    }
    if (this.#queue.length) {
      if (iterations < 5) {
        this.#flush_queue(++iterations);
      } else {
        window.requestAnimationFrame(() => this.#tick());
      }
    }
  }
  #debug(action) {
    switch (true) {
      case action instanceof ForceModel: {
        const vdom = this.#view(action[0]);
        const dispatch = (handler) => (e) => {
          const result = handler(e);
          if (result instanceof Ok) {
            this.send(new Dispatch(result[0]));
          }
        };
        this.#queue = [];
        this.#effects = [];
        this.#didUpdate = false;
        this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
      }
    }
  }
  #shutdown() {
    this.#root.remove();
    this.#root = null;
    this.#model = null;
    this.#queue = [];
    this.#effects = [];
    this.#didUpdate = false;
    this.#update = () => {
    };
    this.#view = () => {
    };
  }
};
var start = (app, selector, flags) => LustreClientApplication2.start(
  flags,
  selector,
  app.init,
  app.update,
  app.view
);
var is_browser = () => globalThis.window && window.document;

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init4, update2, view2, on_attribute_change) {
    super();
    this.init = init4;
    this.update = update2;
    this.view = view2;
    this.on_attribute_change = on_attribute_change;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init4, update2, view2) {
  return new App(init4, update2, view2, new None());
}
function start3(app, selector, flags) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, flags);
    }
  );
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function text2(content) {
  return text(content);
}
function h1(attrs, children) {
  return element("h1", attrs, children);
}
function h2(attrs, children) {
  return element("h2", attrs, children);
}
function nav(attrs, children) {
  return element("nav", attrs, children);
}
function div(attrs, children) {
  return element("div", attrs, children);
}
function p(attrs, children) {
  return element("p", attrs, children);
}
function a(attrs, children) {
  return element("a", attrs, children);
}
function img(attrs) {
  return element("img", attrs, toList([]));
}

// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
var Uri = class extends CustomType {
  constructor(scheme, userinfo, host, port, path2, query, fragment) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path2;
    this.query = query;
    this.fragment = fragment;
  }
};
function regex_submatches(pattern, string3) {
  let _pipe = pattern;
  let _pipe$1 = compile(_pipe, new Options(true, false));
  let _pipe$2 = nil_error(_pipe$1);
  let _pipe$3 = map3(
    _pipe$2,
    (_capture) => {
      return scan(_capture, string3);
    }
  );
  let _pipe$4 = try$(_pipe$3, first);
  let _pipe$5 = map3(_pipe$4, (m) => {
    return m.submatches;
  });
  return unwrap2(_pipe$5, toList([]));
}
function noneify_query(x) {
  if (x instanceof None) {
    return new None();
  } else {
    let x$1 = x[0];
    let $ = pop_grapheme2(x$1);
    if ($.isOk() && $[0][0] === "?") {
      let query = $[0][1];
      return new Some(query);
    } else {
      return new None();
    }
  }
}
function noneify_empty_string(x) {
  if (x instanceof Some && x[0] === "") {
    return new None();
  } else if (x instanceof None) {
    return new None();
  } else {
    return x;
  }
}
function extra_required(loop$list, loop$remaining) {
  while (true) {
    let list2 = loop$list;
    let remaining = loop$remaining;
    if (remaining === 0) {
      return 0;
    } else if (list2.hasLength(0)) {
      return remaining;
    } else {
      let xs = list2.tail;
      loop$list = xs;
      loop$remaining = remaining - 1;
    }
  }
}
function pad_list(list2, size) {
  let _pipe = list2;
  return append2(
    _pipe,
    repeat2(new None(), extra_required(list2, size))
  );
}
function split_authority(authority) {
  let $ = unwrap(authority, "");
  if ($ === "") {
    return [new None(), new None(), new None()];
  } else if ($ === "//") {
    return [new None(), new Some(""), new None()];
  } else {
    let authority$1 = $;
    let matches = (() => {
      let _pipe = "^(//)?((.*)@)?(\\[[a-zA-Z0-9:.]*\\]|[^:]*)(:(\\d*))?";
      let _pipe$1 = regex_submatches(_pipe, authority$1);
      return pad_list(_pipe$1, 6);
    })();
    if (matches.hasLength(6)) {
      let userinfo = matches.tail.tail.head;
      let host = matches.tail.tail.tail.head;
      let port = matches.tail.tail.tail.tail.tail.head;
      let userinfo$1 = noneify_empty_string(userinfo);
      let host$1 = noneify_empty_string(host);
      let port$1 = (() => {
        let _pipe = port;
        let _pipe$1 = unwrap(_pipe, "");
        let _pipe$2 = parse(_pipe$1);
        return from_result(_pipe$2);
      })();
      return [userinfo$1, host$1, port$1];
    } else {
      return [new None(), new None(), new None()];
    }
  }
}
function do_parse(uri_string) {
  let pattern = "^(([a-z][a-z0-9\\+\\-\\.]*):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#.*)?";
  let matches = (() => {
    let _pipe = pattern;
    let _pipe$1 = regex_submatches(_pipe, uri_string);
    return pad_list(_pipe$1, 8);
  })();
  let $ = (() => {
    if (matches.hasLength(8)) {
      let scheme2 = matches.tail.head;
      let authority_with_slashes = matches.tail.tail.head;
      let path3 = matches.tail.tail.tail.tail.head;
      let query_with_question_mark = matches.tail.tail.tail.tail.tail.head;
      let fragment2 = matches.tail.tail.tail.tail.tail.tail.tail.head;
      return [
        scheme2,
        authority_with_slashes,
        path3,
        query_with_question_mark,
        fragment2
      ];
    } else {
      return [new None(), new None(), new None(), new None(), new None()];
    }
  })();
  let scheme = $[0];
  let authority = $[1];
  let path2 = $[2];
  let query = $[3];
  let fragment = $[4];
  let scheme$1 = noneify_empty_string(scheme);
  let path$1 = unwrap(path2, "");
  let query$1 = noneify_query(query);
  let $1 = split_authority(authority);
  let userinfo = $1[0];
  let host = $1[1];
  let port = $1[2];
  let fragment$1 = (() => {
    let _pipe = fragment;
    let _pipe$1 = to_result(_pipe, void 0);
    let _pipe$2 = try$(_pipe$1, pop_grapheme2);
    let _pipe$3 = map3(_pipe$2, second);
    return from_result(_pipe$3);
  })();
  let scheme$2 = (() => {
    let _pipe = scheme$1;
    let _pipe$1 = noneify_empty_string(_pipe);
    return map(_pipe$1, lowercase2);
  })();
  return new Ok(
    new Uri(scheme$2, userinfo, host, port, path$1, query$1, fragment$1)
  );
}
function parse2(uri_string) {
  return do_parse(uri_string);
}
function do_remove_dot_segments(loop$input, loop$accumulator) {
  while (true) {
    let input = loop$input;
    let accumulator = loop$accumulator;
    if (input.hasLength(0)) {
      return reverse(accumulator);
    } else {
      let segment = input.head;
      let rest = input.tail;
      let accumulator$1 = (() => {
        if (segment === "") {
          let accumulator$12 = accumulator;
          return accumulator$12;
        } else if (segment === ".") {
          let accumulator$12 = accumulator;
          return accumulator$12;
        } else if (segment === ".." && accumulator.hasLength(0)) {
          return toList([]);
        } else if (segment === ".." && accumulator.atLeastLength(1)) {
          let accumulator$12 = accumulator.tail;
          return accumulator$12;
        } else {
          let segment$1 = segment;
          let accumulator$12 = accumulator;
          return prepend(segment$1, accumulator$12);
        }
      })();
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}
function remove_dot_segments(input) {
  return do_remove_dot_segments(input, toList([]));
}
function path_segments(path2) {
  return remove_dot_segments(split3(path2, "/"));
}
function to_string6(uri) {
  let parts = (() => {
    let $ = uri.fragment;
    if ($ instanceof Some) {
      let fragment = $[0];
      return toList(["#", fragment]);
    } else {
      return toList([]);
    }
  })();
  let parts$1 = (() => {
    let $ = uri.query;
    if ($ instanceof Some) {
      let query = $[0];
      return prepend("?", prepend(query, parts));
    } else {
      return parts;
    }
  })();
  let parts$2 = prepend(uri.path, parts$1);
  let parts$3 = (() => {
    let $ = uri.host;
    let $1 = starts_with2(uri.path, "/");
    if ($ instanceof Some && !$1 && $[0] !== "") {
      let host = $[0];
      return prepend("/", parts$2);
    } else {
      return parts$2;
    }
  })();
  let parts$4 = (() => {
    let $ = uri.host;
    let $1 = uri.port;
    if ($ instanceof Some && $1 instanceof Some) {
      let port = $1[0];
      return prepend(":", prepend(to_string2(port), parts$3));
    } else {
      return parts$3;
    }
  })();
  let parts$5 = (() => {
    let $ = uri.scheme;
    let $1 = uri.userinfo;
    let $2 = uri.host;
    if ($ instanceof Some && $1 instanceof Some && $2 instanceof Some) {
      let s = $[0];
      let u = $1[0];
      let h = $2[0];
      return prepend(
        s,
        prepend(
          "://",
          prepend(u, prepend("@", prepend(h, parts$4)))
        )
      );
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof Some) {
      let s = $[0];
      let h = $2[0];
      return prepend(s, prepend("://", prepend(h, parts$4)));
    } else if ($ instanceof Some && $1 instanceof Some && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof None && $1 instanceof None && $2 instanceof Some) {
      let h = $2[0];
      return prepend("//", prepend(h, parts$4));
    } else {
      return parts$4;
    }
  })();
  return concat3(parts$5);
}

// build/dev/javascript/modem/modem.ffi.mjs
var defaults = {
  handle_external_links: false,
  handle_internal_links: true
};
var initial_location = window?.location?.href;
var do_initial_uri = () => {
  if (!initial_location) {
    return new Error(void 0);
  } else {
    return new Ok(uri_from_url(new URL(initial_location)));
  }
};
var do_init = (dispatch, options = defaults) => {
  document.body.addEventListener("click", (event) => {
    const a2 = find_anchor(event.target);
    if (!a2)
      return;
    try {
      const url = new URL(a2.href);
      const uri = uri_from_url(url);
      const is_external = url.host !== window.location.host;
      if (!options.handle_external_links && is_external)
        return;
      if (!options.handle_internal_links && !is_external)
        return;
      event.preventDefault();
      if (!is_external) {
        window.history.pushState({}, "", a2.href);
        window.requestAnimationFrame(() => {
          if (url.hash) {
            document.getElementById(url.hash.slice(1))?.scrollIntoView();
          }
        });
      }
      return dispatch(uri);
    } catch {
      return;
    }
  });
  window.addEventListener("popstate", (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    const uri = uri_from_url(url);
    window.requestAnimationFrame(() => {
      if (url.hash) {
        document.getElementById(url.hash.slice(1))?.scrollIntoView();
      }
    });
    dispatch(uri);
  });
  window.addEventListener("modem-push", ({ detail }) => {
    dispatch(detail);
  });
  window.addEventListener("modem-replace", ({ detail }) => {
    dispatch(detail);
  });
};
var find_anchor = (el2) => {
  if (el2.tagName === "BODY") {
    return null;
  } else if (el2.tagName === "A") {
    return el2;
  } else {
    return find_anchor(el2.parentElement);
  }
};
var uri_from_url = (url) => {
  return new Uri(
    /* scheme   */
    url.protocol ? new Some(url.protocol) : new None(),
    /* userinfo */
    new None(),
    /* host     */
    url.hostname ? new Some(url.hostname) : new None(),
    /* port     */
    url.port ? new Some(Number(url.port)) : new None(),
    /* path     */
    url.pathname,
    /* query    */
    url.search ? new Some(url.search.slice(1)) : new None(),
    /* fragment */
    url.hash ? new Some(url.hash.slice(1)) : new None()
  );
};

// build/dev/javascript/modem/modem.mjs
function init2(handler) {
  return from2(
    (dispatch) => {
      return guard(
        !is_browser(),
        void 0,
        () => {
          return do_init(
            (uri) => {
              let _pipe = uri;
              let _pipe$1 = handler(_pipe);
              return dispatch(_pipe$1);
            }
          );
        }
      );
    }
  );
}

// build/dev/javascript/nibble/nibble/lexer.mjs
var Matcher = class extends CustomType {
  constructor(run3) {
    super();
    this.run = run3;
  }
};
var Keep = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Skip = class extends CustomType {
};
var Drop = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var NoMatch = class extends CustomType {
};
var Token = class extends CustomType {
  constructor(span, lexeme, value) {
    super();
    this.span = span;
    this.lexeme = lexeme;
    this.value = value;
  }
};
var Span = class extends CustomType {
  constructor(row_start, col_start, row_end, col_end) {
    super();
    this.row_start = row_start;
    this.col_start = col_start;
    this.row_end = row_end;
    this.col_end = col_end;
  }
};
var NoMatchFound = class extends CustomType {
  constructor(row, col, lexeme) {
    super();
    this.row = row;
    this.col = col;
    this.lexeme = lexeme;
  }
};
var Lexer = class extends CustomType {
  constructor(matchers) {
    super();
    this.matchers = matchers;
  }
};
var State = class extends CustomType {
  constructor(source, tokens, current, row, col) {
    super();
    this.source = source;
    this.tokens = tokens;
    this.current = current;
    this.row = row;
    this.col = col;
  }
};
function simple(matchers) {
  return new Lexer((_) => {
    return matchers;
  });
}
function keep(f) {
  return new Matcher(
    (mode, lexeme, lookahead) => {
      let _pipe = f(lexeme, lookahead);
      let _pipe$1 = map3(
        _pipe,
        (_capture) => {
          return new Keep(_capture, mode);
        }
      );
      return unwrap2(_pipe$1, new NoMatch());
    }
  );
}
function custom(f) {
  return new Matcher(f);
}
function do_match(mode, str, lookahead, matchers) {
  return fold_until(
    matchers,
    new NoMatch(),
    (_, matcher) => {
      let $ = matcher.run(mode, str, lookahead);
      if ($ instanceof Keep) {
        let match = $;
        return new Stop(match);
      } else if ($ instanceof Skip) {
        return new Stop(new Skip());
      } else if ($ instanceof Drop) {
        let match = $;
        return new Stop(match);
      } else {
        return new Continue(new NoMatch());
      }
    }
  );
}
function next_col(col, str) {
  if (str === "\n") {
    return 1;
  } else {
    return col + 1;
  }
}
function next_row(row, str) {
  if (str === "\n") {
    return row + 1;
  } else {
    return row;
  }
}
function do_run(loop$lexer, loop$mode, loop$state) {
  while (true) {
    let lexer2 = loop$lexer;
    let mode = loop$mode;
    let state = loop$state;
    let matchers = lexer2.matchers(mode);
    let $ = state.source;
    let $1 = state.current;
    if ($.hasLength(0) && $1[2] === "") {
      return new Ok(reverse(state.tokens));
    } else if ($.hasLength(0)) {
      let start_row = $1[0];
      let start_col = $1[1];
      let lexeme = $1[2];
      let $2 = do_match(mode, lexeme, "", matchers);
      if ($2 instanceof NoMatch) {
        return new Error(new NoMatchFound(start_row, start_col, lexeme));
      } else if ($2 instanceof Skip) {
        return new Error(new NoMatchFound(start_row, start_col, lexeme));
      } else if ($2 instanceof Drop) {
        return new Ok(reverse(state.tokens));
      } else {
        let value = $2[0];
        let span = new Span(start_row, start_col, state.row, state.col);
        let token$1 = new Token(span, lexeme, value);
        return new Ok(reverse(prepend(token$1, state.tokens)));
      }
    } else {
      let lookahead = $.head;
      let rest = $.tail;
      let start_row = $1[0];
      let start_col = $1[1];
      let lexeme = $1[2];
      let row = next_row(state.row, lookahead);
      let col = next_col(state.col, lookahead);
      let $2 = do_match(mode, lexeme, lookahead, matchers);
      if ($2 instanceof Keep) {
        let value = $2[0];
        let mode$1 = $2[1];
        let span = new Span(start_row, start_col, state.row, state.col);
        let token$1 = new Token(span, lexeme, value);
        loop$lexer = lexer2;
        loop$mode = mode$1;
        loop$state = new State(
          rest,
          prepend(token$1, state.tokens),
          [state.row, state.col, lookahead],
          row,
          col
        );
      } else if ($2 instanceof Skip) {
        loop$lexer = lexer2;
        loop$mode = mode;
        loop$state = new State(
          rest,
          state.tokens,
          [start_row, start_col, lexeme + lookahead],
          row,
          col
        );
      } else if ($2 instanceof Drop) {
        let mode$1 = $2[0];
        loop$lexer = lexer2;
        loop$mode = mode$1;
        loop$state = new State(
          rest,
          state.tokens,
          [state.row, state.col, lookahead],
          row,
          col
        );
      } else {
        loop$lexer = lexer2;
        loop$mode = mode;
        loop$state = new State(
          rest,
          state.tokens,
          [start_row, start_col, lexeme + lookahead],
          row,
          col
        );
      }
    }
  }
}
function run(source, lexer2) {
  let _pipe = graphemes(source);
  let _pipe$1 = new State(_pipe, toList([]), [1, 1, ""], 1, 1);
  return ((_capture) => {
    return do_run(lexer2, void 0, _capture);
  })(_pipe$1);
}

// build/dev/javascript/nibble/nibble.mjs
var Parser = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Cont = class extends CustomType {
  constructor(x0, x1, x2) {
    super();
    this[0] = x0;
    this[1] = x1;
    this[2] = x2;
  }
};
var Fail = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var State2 = class extends CustomType {
  constructor(src2, idx, pos, ctx) {
    super();
    this.src = src2;
    this.idx = idx;
    this.pos = pos;
    this.ctx = ctx;
  }
};
var CanBacktrack = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var EndOfInput = class extends CustomType {
};
var Expected = class extends CustomType {
  constructor(x0, got) {
    super();
    this[0] = x0;
    this.got = got;
  }
};
var Unexpected = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var DeadEnd = class extends CustomType {
  constructor(pos, problem, context) {
    super();
    this.pos = pos;
    this.problem = problem;
    this.context = context;
  }
};
var Empty2 = class extends CustomType {
};
var Cons = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Append = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
function runwrap(state, parser3) {
  let parse5 = parser3[0];
  return parse5(state);
}
function next(state) {
  let $ = get(state.src, state.idx);
  if (!$.isOk()) {
    return [new None(), state];
  } else {
    let span$1 = $[0].span;
    let tok = $[0].value;
    return [
      new Some(tok),
      state.withFields({ idx: state.idx + 1, pos: span$1 })
    ];
  }
}
function return$(value) {
  return new Parser(
    (state) => {
      return new Cont(new CanBacktrack(false), value, state);
    }
  );
}
function succeed(value) {
  return return$(value);
}
function backtrackable(parser3) {
  return new Parser(
    (state) => {
      let $ = runwrap(state, parser3);
      if ($ instanceof Cont) {
        let a2 = $[1];
        let state$1 = $[2];
        return new Cont(new CanBacktrack(false), a2, state$1);
      } else {
        let bag = $[1];
        return new Fail(new CanBacktrack(false), bag);
      }
    }
  );
}
function should_commit(a2, b) {
  let a$1 = a2[0];
  let b$1 = b[0];
  return new CanBacktrack(a$1 || b$1);
}
function do$(parser3, f) {
  return new Parser(
    (state) => {
      let $ = runwrap(state, parser3);
      if ($ instanceof Cont) {
        let to_a = $[0];
        let a2 = $[1];
        let state$1 = $[2];
        let $1 = runwrap(state$1, f(a2));
        if ($1 instanceof Cont) {
          let to_b = $1[0];
          let b = $1[1];
          let state$2 = $1[2];
          return new Cont(should_commit(to_a, to_b), b, state$2);
        } else {
          let to_b = $1[0];
          let bag = $1[1];
          return new Fail(should_commit(to_a, to_b), bag);
        }
      } else {
        let can_backtrack = $[0];
        let bag = $[1];
        return new Fail(can_backtrack, bag);
      }
    }
  );
}
function then$3(parser3, f) {
  return do$(parser3, f);
}
function map5(parser3, f) {
  return do$(parser3, (a2) => {
    return return$(f(a2));
  });
}
function take_while(predicate) {
  return new Parser(
    (state) => {
      let $ = next(state);
      let tok = $[0];
      let next_state = $[1];
      let $1 = map(tok, predicate);
      if (tok instanceof Some && $1 instanceof Some && $1[0]) {
        let tok$1 = tok[0];
        return runwrap(
          next_state,
          do$(
            take_while(predicate),
            (toks) => {
              return return$(prepend(tok$1, toks));
            }
          )
        );
      } else if (tok instanceof Some && $1 instanceof Some && !$1[0]) {
        return new Cont(new CanBacktrack(false), toList([]), state);
      } else {
        return new Cont(new CanBacktrack(false), toList([]), state);
      }
    }
  );
}
function take_exactly(parser3, count) {
  if (count === 0) {
    return return$(toList([]));
  } else {
    return do$(
      parser3,
      (x) => {
        return do$(
          take_exactly(parser3, count - 1),
          (xs) => {
            return return$(prepend(x, xs));
          }
        );
      }
    );
  }
}
function bag_from_state(state, problem) {
  return new Cons(new Empty2(), new DeadEnd(state.pos, problem, state.ctx));
}
function token2(tok) {
  return new Parser(
    (state) => {
      let $ = next(state);
      if ($[0] instanceof Some && isEqual(tok, $[0][0])) {
        let t = $[0][0];
        let state$1 = $[1];
        return new Cont(new CanBacktrack(true), void 0, state$1);
      } else if ($[0] instanceof Some) {
        let t = $[0][0];
        let state$1 = $[1];
        return new Fail(
          new CanBacktrack(false),
          bag_from_state(state$1, new Expected(inspect2(tok), t))
        );
      } else {
        let state$1 = $[1];
        return new Fail(
          new CanBacktrack(false),
          bag_from_state(state$1, new EndOfInput())
        );
      }
    }
  );
}
function eof() {
  return new Parser(
    (state) => {
      let $ = next(state);
      if ($[0] instanceof Some) {
        let tok = $[0][0];
        let state$1 = $[1];
        return new Fail(
          new CanBacktrack(false),
          bag_from_state(state$1, new Unexpected(tok))
        );
      } else {
        return new Cont(new CanBacktrack(false), void 0, state);
      }
    }
  );
}
function take_if(expecting, predicate) {
  return new Parser(
    (state) => {
      let $ = next(state);
      let tok = $[0];
      let next_state = $[1];
      let $1 = map(tok, predicate);
      if (tok instanceof Some && $1 instanceof Some && $1[0]) {
        let tok$1 = tok[0];
        return new Cont(new CanBacktrack(false), tok$1, next_state);
      } else if (tok instanceof Some && $1 instanceof Some && !$1[0]) {
        let tok$1 = tok[0];
        return new Fail(
          new CanBacktrack(false),
          bag_from_state(next_state, new Expected(expecting, tok$1))
        );
      } else {
        return new Fail(
          new CanBacktrack(false),
          bag_from_state(next_state, new EndOfInput())
        );
      }
    }
  );
}
function take_while1(expecting, predicate) {
  return do$(
    take_if(expecting, predicate),
    (x) => {
      return do$(
        take_while(predicate),
        (xs) => {
          return return$(prepend(x, xs));
        }
      );
    }
  );
}
function to_deadends(loop$bag, loop$acc) {
  while (true) {
    let bag = loop$bag;
    let acc = loop$acc;
    if (bag instanceof Empty2) {
      return acc;
    } else if (bag instanceof Cons && bag[0] instanceof Empty2) {
      let deadend = bag[1];
      return prepend(deadend, acc);
    } else if (bag instanceof Cons) {
      let bag$1 = bag[0];
      let deadend = bag[1];
      loop$bag = bag$1;
      loop$acc = prepend(deadend, acc);
    } else {
      let left = bag[0];
      let right = bag[1];
      loop$bag = left;
      loop$acc = to_deadends(right, acc);
    }
  }
}
function run2(src2, parser3) {
  let src$1 = index_fold(
    src2,
    new$(),
    (dict, tok, idx) => {
      return insert(dict, idx, tok);
    }
  );
  let init4 = new State2(src$1, 0, new Span(1, 1, 1, 1), toList([]));
  let $ = runwrap(init4, parser3);
  if ($ instanceof Cont) {
    let a2 = $[1];
    return new Ok(a2);
  } else {
    let bag = $[1];
    return new Error(to_deadends(bag, toList([])));
  }
}
function add_bag_to_step(step, left) {
  if (step instanceof Cont) {
    let can_backtrack = step[0];
    let a2 = step[1];
    let state = step[2];
    return new Cont(can_backtrack, a2, state);
  } else {
    let can_backtrack = step[0];
    let right = step[1];
    return new Fail(can_backtrack, new Append(left, right));
  }
}
function one_of(parsers) {
  return new Parser(
    (state) => {
      let init4 = new Fail(new CanBacktrack(false), new Empty2());
      return fold_until(
        parsers,
        init4,
        (result, next2) => {
          if (result instanceof Cont) {
            return new Stop(result);
          } else if (result instanceof Fail && result[0] instanceof CanBacktrack && result[0][0]) {
            return new Stop(result);
          } else {
            let bag = result[1];
            let _pipe = runwrap(state, next2);
            let _pipe$1 = add_bag_to_step(_pipe, bag);
            return new Continue(_pipe$1);
          }
        }
      );
    }
  );
}
function optional2(parser3) {
  return one_of(
    toList([
      map5(parser3, (var0) => {
        return new Some(var0);
      }),
      return$(new None())
    ])
  );
}

// build/dev/javascript/rada/rada/date/parse.mjs
var Digit = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var WeekToken = class extends CustomType {
};
var Dash = class extends CustomType {
};
var TimeToken = class extends CustomType {
};
var Other = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function lexer() {
  let options = new Options(false, true);
  let $ = compile("^[0-9]+$", options);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "rada/date/parse",
      14,
      "lexer",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  let digits_regex = $[0];
  let is_digits = (str) => {
    return check(digits_regex, str);
  };
  return simple(
    toList([
      custom(
        (mode, lexeme, _) => {
          if (lexeme === "") {
            return new Drop(mode);
          } else if (lexeme === "W") {
            return new Keep(new WeekToken(), mode);
          } else if (lexeme === "T") {
            return new Keep(new TimeToken(), mode);
          } else if (lexeme === "-") {
            return new Keep(new Dash(), mode);
          } else {
            let $1 = is_digits(lexeme);
            if ($1) {
              return new Keep(new Digit(lexeme), mode);
            } else {
              return new Keep(new Other(lexeme), mode);
            }
          }
        }
      )
    ])
  );
}

// build/dev/javascript/rada/rada/date/pattern.mjs
var Field = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Literal = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Alpha = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Quote = class extends CustomType {
};
var EscapedQuote = class extends CustomType {
};
var Text2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function is_alpha(token3) {
  if (token3 instanceof Alpha) {
    return true;
  } else {
    return false;
  }
}
function is_specific_alpha(char) {
  return (token3) => {
    if (token3 instanceof Alpha) {
      let c = token3[0];
      return c === char;
    } else {
      return false;
    }
  };
}
function is_text(token3) {
  if (token3 instanceof Text2) {
    return true;
  } else {
    return false;
  }
}
function is_quote(token3) {
  if (token3 instanceof Quote) {
    return true;
  } else {
    return false;
  }
}
function extract_content(tokens) {
  if (tokens.hasLength(0)) {
    return "";
  } else {
    let token3 = tokens.head;
    let rest = tokens.tail;
    if (token3 instanceof Alpha) {
      let str = token3[0];
      return str + extract_content(rest);
    } else if (token3 instanceof Quote) {
      return "'" + extract_content(rest);
    } else if (token3 instanceof EscapedQuote) {
      return "'" + extract_content(rest);
    } else {
      let str = token3[0];
      return str + extract_content(rest);
    }
  }
}
function field2() {
  return do$(
    take_if("Expecting an Alpha token", is_alpha),
    (alpha) => {
      if (!(alpha instanceof Alpha)) {
        throw makeError(
          "assignment_no_match",
          "rada/date/pattern",
          170,
          "",
          "Assignment pattern did not match",
          { value: alpha }
        );
      }
      let char = alpha[0];
      return do$(
        take_while(is_specific_alpha(char)),
        (rest) => {
          return return$(new Field(char, length2(rest) + 1));
        }
      );
    }
  );
}
function escaped_quote() {
  let _pipe = token2(new EscapedQuote());
  return then$3(
    _pipe,
    (_) => {
      return succeed(new Literal("'"));
    }
  );
}
function literal() {
  return do$(
    take_if("Expecting an Text token", is_text),
    (text3) => {
      return do$(
        take_while(is_text),
        (rest) => {
          let joined = (() => {
            let _pipe = map2(
              prepend(text3, rest),
              (entry) => {
                if (!(entry instanceof Text2)) {
                  throw makeError(
                    "assignment_no_match",
                    "rada/date/pattern",
                    216,
                    "",
                    "Assignment pattern did not match",
                    { value: entry }
                  );
                }
                let text$1 = entry[0];
                return text$1;
              }
            );
            return concat3(_pipe);
          })();
          return return$(new Literal(joined));
        }
      );
    }
  );
}
function quoted_help(result) {
  return one_of(
    toList([
      do$(
        take_while1(
          "Expecting a non-Quote",
          (token3) => {
            return !is_quote(token3);
          }
        ),
        (tokens) => {
          let str = extract_content(tokens);
          return quoted_help(result + str);
        }
      ),
      (() => {
        let _pipe = token2(new EscapedQuote());
        return then$3(
          _pipe,
          (_) => {
            return quoted_help(result + "'");
          }
        );
      })(),
      succeed(result)
    ])
  );
}
function quoted() {
  return do$(
    take_if("Expecting an Quote", is_quote),
    (_) => {
      return do$(
        quoted_help(""),
        (text3) => {
          return do$(
            one_of(
              toList([
                (() => {
                  let _pipe = take_if("Expecting an Quote", is_quote);
                  return map5(_pipe, (_2) => {
                    return void 0;
                  });
                })(),
                eof()
              ])
            ),
            (_2) => {
              return return$(new Literal(text3));
            }
          );
        }
      );
    }
  );
}
function finalize(tokens) {
  return fold(
    tokens,
    toList([]),
    (tokens2, token3) => {
      if (token3 instanceof Literal && tokens2.atLeastLength(1) && tokens2.head instanceof Literal) {
        let x = token3[0];
        let y = tokens2.head[0];
        let rest = tokens2.tail;
        return prepend(new Literal(x + y), rest);
      } else {
        return prepend(token3, tokens2);
      }
    }
  );
}
function parser(tokens) {
  return one_of(
    toList([
      (() => {
        let _pipe = one_of(
          toList([field2(), literal(), escaped_quote(), quoted()])
        );
        return then$3(
          _pipe,
          (token3) => {
            return parser(prepend(token3, tokens));
          }
        );
      })(),
      succeed(finalize(tokens))
    ])
  );
}
function from_string3(str) {
  let alpha = (() => {
    let _pipe = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let _pipe$1 = graphemes(_pipe);
    return from_list2(_pipe$1);
  })();
  let is_alpha$1 = (char) => {
    return contains(alpha, char);
  };
  let l = simple(
    toList([
      keep(
        (lexeme, _) => {
          let $ = is_alpha$1(lexeme);
          if ($) {
            return new Ok(new Alpha(lexeme));
          } else {
            return new Error(void 0);
          }
        }
      ),
      custom(
        (mode, lexeme, next_grapheme) => {
          if (lexeme === "'") {
            if (next_grapheme === "'") {
              return new Skip();
            } else {
              return new Keep(new Quote(), mode);
            }
          } else if (lexeme === "''") {
            return new Keep(new EscapedQuote(), mode);
          } else {
            return new NoMatch();
          }
        }
      ),
      keep(
        (lexeme, _) => {
          if (lexeme === "") {
            return new Error(void 0);
          } else {
            return new Ok(new Text2(lexeme));
          }
        }
      )
    ])
  );
  let tokens_result = run(str, l);
  if (tokens_result.isOk()) {
    let tokens = tokens_result[0];
    let _pipe = run2(tokens, parser(toList([])));
    return unwrap2(_pipe, toList([new Literal(str)]));
  } else {
    return toList([]);
  }
}

// build/dev/javascript/rada/rada/date.mjs
var Jan = class extends CustomType {
};
var Feb = class extends CustomType {
};
var Mar = class extends CustomType {
};
var Apr = class extends CustomType {
};
var May = class extends CustomType {
};
var Jun = class extends CustomType {
};
var Jul = class extends CustomType {
};
var Aug = class extends CustomType {
};
var Sep = class extends CustomType {
};
var Oct = class extends CustomType {
};
var Nov = class extends CustomType {
};
var Dec = class extends CustomType {
};
var Mon = class extends CustomType {
};
var Tue = class extends CustomType {
};
var Wed = class extends CustomType {
};
var Thu = class extends CustomType {
};
var Fri = class extends CustomType {
};
var Sat = class extends CustomType {
};
var Sun = class extends CustomType {
};
var RD = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var OrdinalDate = class extends CustomType {
  constructor(year2, ordinal_day2) {
    super();
    this.year = year2;
    this.ordinal_day = ordinal_day2;
  }
};
var CalendarDate = class extends CustomType {
  constructor(year2, month2, day2) {
    super();
    this.year = year2;
    this.month = month2;
    this.day = day2;
  }
};
var WeekDate = class extends CustomType {
  constructor(week_year2, week_number2, weekday2) {
    super();
    this.week_year = week_year2;
    this.week_number = week_number2;
    this.weekday = weekday2;
  }
};
var Language = class extends CustomType {
  constructor(month_name, month_name_short, weekday_name, weekday_name_short, day_with_suffix) {
    super();
    this.month_name = month_name;
    this.month_name_short = month_name_short;
    this.weekday_name = weekday_name;
    this.weekday_name_short = weekday_name_short;
    this.day_with_suffix = day_with_suffix;
  }
};
var MonthAndDay = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var WeekAndWeekday = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var OrdinalDay = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function string_take_right(str, count) {
  return slice(str, -1 * count, count);
}
function string_take_left(str, count) {
  return slice(str, 0, count);
}
function month_to_name(month2) {
  if (month2 instanceof Jan) {
    return "January";
  } else if (month2 instanceof Feb) {
    return "February";
  } else if (month2 instanceof Mar) {
    return "March";
  } else if (month2 instanceof Apr) {
    return "April";
  } else if (month2 instanceof May) {
    return "May";
  } else if (month2 instanceof Jun) {
    return "June";
  } else if (month2 instanceof Jul) {
    return "July";
  } else if (month2 instanceof Aug) {
    return "August";
  } else if (month2 instanceof Sep) {
    return "September";
  } else if (month2 instanceof Oct) {
    return "October";
  } else if (month2 instanceof Nov) {
    return "November";
  } else {
    return "December";
  }
}
function weekday_to_name(weekday2) {
  if (weekday2 instanceof Mon) {
    return "Monday";
  } else if (weekday2 instanceof Tue) {
    return "Tuesday";
  } else if (weekday2 instanceof Wed) {
    return "Wednesday";
  } else if (weekday2 instanceof Thu) {
    return "Thursday";
  } else if (weekday2 instanceof Fri) {
    return "Friday";
  } else if (weekday2 instanceof Sat) {
    return "Saturday";
  } else {
    return "Sunday";
  }
}
function parse_digit() {
  return take_if(
    "Expecting digit",
    (token3) => {
      if (token3 instanceof Digit) {
        return true;
      } else {
        return false;
      }
    }
  );
}
function int_4() {
  return do$(
    optional2(token2(new Dash())),
    (negative) => {
      let negative$1 = (() => {
        let _pipe = negative;
        let _pipe$1 = map(_pipe, (_) => {
          return "-";
        });
        return unwrap(_pipe$1, "");
      })();
      return do$(
        (() => {
          let _pipe = parse_digit();
          return take_exactly(_pipe, 4);
        })(),
        (tokens) => {
          let str = (() => {
            let _pipe = map2(
              tokens,
              (token3) => {
                if (!(token3 instanceof Digit)) {
                  throw makeError(
                    "assignment_no_match",
                    "rada/date",
                    1091,
                    "",
                    "Assignment pattern did not match",
                    { value: token3 }
                  );
                }
                let str2 = token3[0];
                return str2;
              }
            );
            return concat3(_pipe);
          })();
          let $ = parse(negative$1 + str);
          if (!$.isOk()) {
            throw makeError(
              "assignment_no_match",
              "rada/date",
              1096,
              "",
              "Assignment pattern did not match",
              { value: $ }
            );
          }
          let int3 = $[0];
          return return$(int3);
        }
      );
    }
  );
}
function int_3() {
  return do$(
    (() => {
      let _pipe = parse_digit();
      return take_exactly(_pipe, 3);
    })(),
    (tokens) => {
      let str = (() => {
        let _pipe = map2(
          tokens,
          (token3) => {
            if (!(token3 instanceof Digit)) {
              throw makeError(
                "assignment_no_match",
                "rada/date",
                1109,
                "",
                "Assignment pattern did not match",
                { value: token3 }
              );
            }
            let str2 = token3[0];
            return str2;
          }
        );
        return concat3(_pipe);
      })();
      let $ = parse(str);
      if (!$.isOk()) {
        throw makeError(
          "assignment_no_match",
          "rada/date",
          1114,
          "",
          "Assignment pattern did not match",
          { value: $ }
        );
      }
      let int3 = $[0];
      return return$(int3);
    }
  );
}
function parse_ordinal_day() {
  return do$(
    int_3(),
    (day2) => {
      return return$(new OrdinalDay(day2));
    }
  );
}
function int_2() {
  return do$(
    (() => {
      let _pipe = parse_digit();
      return take_exactly(_pipe, 2);
    })(),
    (tokens) => {
      let str = (() => {
        let _pipe = map2(
          tokens,
          (token3) => {
            if (!(token3 instanceof Digit)) {
              throw makeError(
                "assignment_no_match",
                "rada/date",
                1127,
                "",
                "Assignment pattern did not match",
                { value: token3 }
              );
            }
            let str2 = token3[0];
            return str2;
          }
        );
        return concat3(_pipe);
      })();
      let $ = parse(str);
      if (!$.isOk()) {
        throw makeError(
          "assignment_no_match",
          "rada/date",
          1132,
          "",
          "Assignment pattern did not match",
          { value: $ }
        );
      }
      let int3 = $[0];
      return return$(int3);
    }
  );
}
function parse_month_and_day(extended) {
  return do$(
    int_2(),
    (month2) => {
      let dash_count = to_int(extended);
      return do$(
        one_of(
          toList([
            (() => {
              let _pipe = take_exactly(
                token2(new Dash()),
                dash_count
              );
              return then$3(_pipe, (_) => {
                return int_2();
              });
            })(),
            (() => {
              let _pipe = eof();
              return then$3(_pipe, (_) => {
                return succeed(1);
              });
            })()
          ])
        ),
        (day2) => {
          return return$(new MonthAndDay(month2, day2));
        }
      );
    }
  );
}
function int_1() {
  return do$(
    (() => {
      let _pipe = parse_digit();
      return take_exactly(_pipe, 1);
    })(),
    (tokens) => {
      if (!tokens.hasLength(1) || !(tokens.head instanceof Digit)) {
        throw makeError(
          "assignment_no_match",
          "rada/date",
          1143,
          "",
          "Assignment pattern did not match",
          { value: tokens }
        );
      }
      let str = tokens.head[0];
      let $ = parse(str);
      if (!$.isOk()) {
        throw makeError(
          "assignment_no_match",
          "rada/date",
          1145,
          "",
          "Assignment pattern did not match",
          { value: $ }
        );
      }
      let int3 = $[0];
      return return$(int3);
    }
  );
}
function parse_week_and_weekday(extended) {
  return do$(
    token2(new WeekToken()),
    (_) => {
      return do$(
        int_2(),
        (week) => {
          let dash_count = to_int(extended);
          return do$(
            one_of(
              toList([
                (() => {
                  let _pipe = take_exactly(
                    token2(new Dash()),
                    dash_count
                  );
                  return then$3(_pipe, (_2) => {
                    return int_1();
                  });
                })(),
                succeed(1)
              ])
            ),
            (day2) => {
              return return$(new WeekAndWeekday(week, day2));
            }
          );
        }
      );
    }
  );
}
function parse_day_of_year() {
  return one_of(
    toList([
      (() => {
        let _pipe = token2(new Dash());
        return then$3(
          _pipe,
          (_) => {
            return one_of(
              toList([
                backtrackable(parse_ordinal_day()),
                parse_month_and_day(true),
                parse_week_and_weekday(true)
              ])
            );
          }
        );
      })(),
      backtrackable(parse_month_and_day(false)),
      parse_ordinal_day(),
      parse_week_and_weekday(false),
      succeed(new OrdinalDay(1))
    ])
  );
}
function compare3(date1, date2) {
  let rd_1 = date1[0];
  let rd_2 = date2[0];
  return compare(rd_1, rd_2);
}
function month_to_number(month2) {
  if (month2 instanceof Jan) {
    return 1;
  } else if (month2 instanceof Feb) {
    return 2;
  } else if (month2 instanceof Mar) {
    return 3;
  } else if (month2 instanceof Apr) {
    return 4;
  } else if (month2 instanceof May) {
    return 5;
  } else if (month2 instanceof Jun) {
    return 6;
  } else if (month2 instanceof Jul) {
    return 7;
  } else if (month2 instanceof Aug) {
    return 8;
  } else if (month2 instanceof Sep) {
    return 9;
  } else if (month2 instanceof Oct) {
    return 10;
  } else if (month2 instanceof Nov) {
    return 11;
  } else {
    return 12;
  }
}
function month_to_quarter(month2) {
  return divideInt(month_to_number(month2) + 2, 3);
}
function number_to_month(month_number2) {
  let $ = max(1, month_number2);
  if ($ === 1) {
    return new Jan();
  } else if ($ === 2) {
    return new Feb();
  } else if ($ === 3) {
    return new Mar();
  } else if ($ === 4) {
    return new Apr();
  } else if ($ === 5) {
    return new May();
  } else if ($ === 6) {
    return new Jun();
  } else if ($ === 7) {
    return new Jul();
  } else if ($ === 8) {
    return new Aug();
  } else if ($ === 9) {
    return new Sep();
  } else if ($ === 10) {
    return new Oct();
  } else if ($ === 11) {
    return new Nov();
  } else {
    return new Dec();
  }
}
function number_to_weekday(weekday_number2) {
  let $ = max(1, weekday_number2);
  if ($ === 1) {
    return new Mon();
  } else if ($ === 2) {
    return new Tue();
  } else if ($ === 3) {
    return new Wed();
  } else if ($ === 4) {
    return new Thu();
  } else if ($ === 5) {
    return new Fri();
  } else if ($ === 6) {
    return new Sat();
  } else {
    return new Sun();
  }
}
function pad_signed_int(value, length5) {
  let prefix = (() => {
    let $ = value < 0;
    if ($) {
      return "-";
    } else {
      return "";
    }
  })();
  let suffix = (() => {
    let _pipe = value;
    let _pipe$1 = absolute_value(_pipe);
    let _pipe$2 = to_string2(_pipe$1);
    return pad_left(_pipe$2, length5, "0");
  })();
  return prefix + suffix;
}
function floor_div(dividend, divisor) {
  let $ = (dividend > 0 && divisor < 0 || dividend < 0 && divisor > 0) && remainderInt(
    dividend,
    divisor
  ) !== 0;
  if ($) {
    return divideInt(dividend, divisor) - 1;
  } else {
    return divideInt(dividend, divisor);
  }
}
function days_before_year(year1) {
  let year$1 = year1 - 1;
  let leap_years = floor_div(year$1, 4) - floor_div(year$1, 100) + floor_div(
    year$1,
    400
  );
  return 365 * year$1 + leap_years;
}
function first_of_year(year2) {
  return new RD(days_before_year(year2) + 1);
}
function modulo_unwrap(dividend, divisor) {
  let remainder = remainderInt(dividend, divisor);
  let $ = remainder > 0 && divisor < 0 || remainder < 0 && divisor > 0;
  if ($) {
    return remainder + divisor;
  } else {
    return remainder;
  }
}
function is_leap_year(year2) {
  return modulo_unwrap(year2, 4) === 0 && modulo_unwrap(year2, 100) !== 0 || modulo_unwrap(
    year2,
    400
  ) === 0;
}
function weekday_number(date) {
  let rd = date[0];
  let $ = modulo_unwrap(rd, 7);
  if ($ === 0) {
    return 7;
  } else {
    let n = $;
    return n;
  }
}
function days_before_week_year(year2) {
  let jan4 = days_before_year(year2) + 4;
  return jan4 - weekday_number(new RD(jan4));
}
function is_53_week_year(year2) {
  let wdn_jan1 = weekday_number(first_of_year(year2));
  return wdn_jan1 === 4 || wdn_jan1 === 3 && is_leap_year(year2);
}
function weekday(date) {
  let _pipe = date;
  let _pipe$1 = weekday_number(_pipe);
  return number_to_weekday(_pipe$1);
}
function ordinal_suffix(value) {
  let value_mod_100 = modulo_unwrap(value, 100);
  let value$1 = (() => {
    let $2 = value_mod_100 < 20;
    if ($2) {
      return value_mod_100;
    } else {
      return modulo_unwrap(value_mod_100, 10);
    }
  })();
  let $ = min(value$1, 4);
  if ($ === 1) {
    return "st";
  } else if ($ === 2) {
    return "nd";
  } else if ($ === 3) {
    return "rd";
  } else {
    return "th";
  }
}
function with_ordinal_suffix(value) {
  return to_string2(value) + ordinal_suffix(value);
}
function language_en() {
  return new Language(
    month_to_name,
    (val) => {
      let _pipe = val;
      let _pipe$1 = month_to_name(_pipe);
      return string_take_left(_pipe$1, 3);
    },
    weekday_to_name,
    (val) => {
      let _pipe = val;
      let _pipe$1 = weekday_to_name(_pipe);
      return string_take_left(_pipe$1, 3);
    },
    with_ordinal_suffix
  );
}
function days_in_month(year2, month2) {
  if (month2 instanceof Jan) {
    return 31;
  } else if (month2 instanceof Feb) {
    let $ = is_leap_year(year2);
    if ($) {
      return 29;
    } else {
      return 28;
    }
  } else if (month2 instanceof Mar) {
    return 31;
  } else if (month2 instanceof Apr) {
    return 30;
  } else if (month2 instanceof May) {
    return 31;
  } else if (month2 instanceof Jun) {
    return 30;
  } else if (month2 instanceof Jul) {
    return 31;
  } else if (month2 instanceof Aug) {
    return 31;
  } else if (month2 instanceof Sep) {
    return 30;
  } else if (month2 instanceof Oct) {
    return 31;
  } else if (month2 instanceof Nov) {
    return 30;
  } else {
    return 31;
  }
}
function to_calendar_date_helper(loop$year, loop$month, loop$ordinal_day) {
  while (true) {
    let year2 = loop$year;
    let month2 = loop$month;
    let ordinal_day2 = loop$ordinal_day;
    let month_days = days_in_month(year2, month2);
    let month_number$1 = month_to_number(month2);
    let $ = month_number$1 < 12 && ordinal_day2 > month_days;
    if ($) {
      loop$year = year2;
      loop$month = number_to_month(month_number$1 + 1);
      loop$ordinal_day = ordinal_day2 - month_days;
    } else {
      return new CalendarDate(year2, month2, ordinal_day2);
    }
  }
}
function days_before_month(year2, month2) {
  let leap_days = to_int(is_leap_year(year2));
  if (month2 instanceof Jan) {
    return 0;
  } else if (month2 instanceof Feb) {
    return 31;
  } else if (month2 instanceof Mar) {
    return 59 + leap_days;
  } else if (month2 instanceof Apr) {
    return 90 + leap_days;
  } else if (month2 instanceof May) {
    return 120 + leap_days;
  } else if (month2 instanceof Jun) {
    return 151 + leap_days;
  } else if (month2 instanceof Jul) {
    return 181 + leap_days;
  } else if (month2 instanceof Aug) {
    return 212 + leap_days;
  } else if (month2 instanceof Sep) {
    return 243 + leap_days;
  } else if (month2 instanceof Oct) {
    return 273 + leap_days;
  } else if (month2 instanceof Nov) {
    return 304 + leap_days;
  } else {
    return 334 + leap_days;
  }
}
function div_with_remainder(a2, b) {
  return [floor_div(a2, b), modulo_unwrap(a2, b)];
}
function year(date) {
  let rd = date[0];
  let $ = div_with_remainder(rd, 146097);
  let n400 = $[0];
  let r400 = $[1];
  let $1 = div_with_remainder(r400, 36524);
  let n100 = $1[0];
  let r100 = $1[1];
  let $2 = div_with_remainder(r100, 1461);
  let n4 = $2[0];
  let r4 = $2[1];
  let $3 = div_with_remainder(r4, 365);
  let n1 = $3[0];
  let r1 = $3[1];
  let n = (() => {
    let $4 = r1 === 0;
    if ($4) {
      return 0;
    } else {
      return 1;
    }
  })();
  return n400 * 400 + n100 * 100 + n4 * 4 + n1 + n;
}
function to_ordinal_date(date) {
  let rd = date[0];
  let year_ = year(date);
  return new OrdinalDate(year_, rd - days_before_year(year_));
}
function to_calendar_date(date) {
  let ordinal_date = to_ordinal_date(date);
  return to_calendar_date_helper(
    ordinal_date.year,
    new Jan(),
    ordinal_date.ordinal_day
  );
}
function to_week_date(date) {
  let rd = date[0];
  let weekday_number_ = weekday_number(date);
  let week_year$1 = year(new RD(rd + (4 - weekday_number_)));
  let week_1_day_1 = days_before_week_year(week_year$1) + 1;
  return new WeekDate(
    week_year$1,
    1 + divideInt(rd - week_1_day_1, 7),
    number_to_weekday(weekday_number_)
  );
}
function ordinal_day(date) {
  return to_ordinal_date(date).ordinal_day;
}
function month(date) {
  return to_calendar_date(date).month;
}
function month_number(date) {
  let _pipe = date;
  let _pipe$1 = month(_pipe);
  return month_to_number(_pipe$1);
}
function quarter(date) {
  let _pipe = date;
  let _pipe$1 = month(_pipe);
  return month_to_quarter(_pipe$1);
}
function day(date) {
  return to_calendar_date(date).day;
}
function week_year(date) {
  return to_week_date(date).week_year;
}
function week_number(date) {
  return to_week_date(date).week_number;
}
function format_field(loop$date, loop$language, loop$char, loop$length) {
  while (true) {
    let date = loop$date;
    let language = loop$language;
    let char = loop$char;
    let length5 = loop$length;
    if (char === "y") {
      if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = year(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        let _pipe$3 = pad_left(_pipe$2, 2, "0");
        return string_take_right(_pipe$3, 2);
      } else {
        let _pipe = date;
        let _pipe$1 = year(_pipe);
        return pad_signed_int(_pipe$1, length5);
      }
    } else if (char === "Y") {
      if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = week_year(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        let _pipe$3 = pad_left(_pipe$2, 2, "0");
        return string_take_right(_pipe$3, 2);
      } else {
        let _pipe = date;
        let _pipe$1 = week_year(_pipe);
        return pad_signed_int(_pipe$1, length5);
      }
    } else if (char === "Q") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = quarter(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = quarter(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 3) {
        let _pipe = date;
        let _pipe$1 = quarter(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return ((str) => {
          return "Q" + str;
        })(_pipe$2);
      } else if (length5 === 4) {
        let _pipe = date;
        let _pipe$1 = quarter(_pipe);
        return with_ordinal_suffix(_pipe$1);
      } else if (length5 === 5) {
        let _pipe = date;
        let _pipe$1 = quarter(_pipe);
        return to_string2(_pipe$1);
      } else {
        return "";
      }
    } else if (char === "M") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = month_number(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = month_number(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return pad_left(_pipe$2, 2, "0");
      } else if (length5 === 3) {
        let _pipe = date;
        let _pipe$1 = month(_pipe);
        return language.month_name_short(_pipe$1);
      } else if (length5 === 4) {
        let _pipe = date;
        let _pipe$1 = month(_pipe);
        return language.month_name(_pipe$1);
      } else if (length5 === 5) {
        let _pipe = date;
        let _pipe$1 = month(_pipe);
        let _pipe$2 = language.month_name_short(_pipe$1);
        return string_take_left(_pipe$2, 1);
      } else {
        return "";
      }
    } else if (char === "w") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = week_number(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = week_number(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return pad_left(_pipe$2, 2, "0");
      } else {
        return "";
      }
    } else if (char === "d") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = day(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = day(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return pad_left(_pipe$2, 2, "0");
      } else if (length5 === 3) {
        let _pipe = date;
        let _pipe$1 = day(_pipe);
        return language.day_with_suffix(_pipe$1);
      } else {
        return "";
      }
    } else if (char === "D") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = ordinal_day(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = ordinal_day(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return pad_left(_pipe$2, 2, "0");
      } else if (length5 === 3) {
        let _pipe = date;
        let _pipe$1 = ordinal_day(_pipe);
        let _pipe$2 = to_string2(_pipe$1);
        return pad_left(_pipe$2, 3, "0");
      } else {
        return "";
      }
    } else if (char === "E") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        return language.weekday_name_short(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        return language.weekday_name_short(_pipe$1);
      } else if (length5 === 3) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        return language.weekday_name_short(_pipe$1);
      } else if (length5 === 4) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        return language.weekday_name(_pipe$1);
      } else if (length5 === 5) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        let _pipe$2 = language.weekday_name_short(_pipe$1);
        return string_take_left(_pipe$2, 1);
      } else if (length5 === 6) {
        let _pipe = date;
        let _pipe$1 = weekday(_pipe);
        let _pipe$2 = language.weekday_name_short(_pipe$1);
        return string_take_left(_pipe$2, 2);
      } else {
        return "";
      }
    } else if (char === "e") {
      if (length5 === 1) {
        let _pipe = date;
        let _pipe$1 = weekday_number(_pipe);
        return to_string2(_pipe$1);
      } else if (length5 === 2) {
        let _pipe = date;
        let _pipe$1 = weekday_number(_pipe);
        return to_string2(_pipe$1);
      } else {
        let _pipe = date;
        loop$date = _pipe;
        loop$language = language;
        loop$char = "E";
        loop$length = length5;
      }
    } else {
      return "";
    }
  }
}
function format_with_tokens(language, tokens, date) {
  return fold(
    tokens,
    "",
    (formatted, token3) => {
      if (token3 instanceof Field) {
        let char = token3[0];
        let length5 = token3[1];
        return format_field(date, language, char, length5) + formatted;
      } else {
        let str = token3[0];
        return str + formatted;
      }
    }
  );
}
function format_with_language(date, language, pattern_text) {
  let tokens = (() => {
    let _pipe = pattern_text;
    let _pipe$1 = from_string3(_pipe);
    return reverse(_pipe$1);
  })();
  return format_with_tokens(language, tokens, date);
}
function format(date, pattern) {
  return format_with_language(date, language_en(), pattern);
}
function to_iso_string(date) {
  return format(date, "yyyy-MM-dd");
}
function is_between_int(value, lower, upper) {
  return lower <= value && value <= upper;
}
function from_ordinal_parts(year2, ordinal) {
  let days_in_year = (() => {
    let $2 = is_leap_year(year2);
    if ($2) {
      return 366;
    } else {
      return 365;
    }
  })();
  let $ = !is_between_int(ordinal, 1, days_in_year);
  if ($) {
    return new Error(
      "Invalid ordinal date: " + ("ordinal-day " + to_string2(ordinal) + " is out of range") + (" (1 to " + to_string2(
        days_in_year
      ) + ")") + (" for " + to_string2(year2)) + ("; received (year " + to_string2(
        year2
      ) + ", ordinal-day " + to_string2(ordinal) + ")")
    );
  } else {
    return new Ok(new RD(days_before_year(year2) + ordinal));
  }
}
function from_calendar_parts(year2, month_number2, day2) {
  let $ = is_between_int(month_number2, 1, 12);
  let $1 = is_between_int(
    day2,
    1,
    days_in_month(year2, number_to_month(month_number2))
  );
  if (!$) {
    return new Error(
      "Invalid date: " + ("month " + to_string2(month_number2) + " is out of range") + " (1 to 12)" + ("; received (year " + to_string2(
        year2
      ) + ", month " + to_string2(month_number2) + ", day " + to_string2(
        day2
      ) + ")")
    );
  } else if ($ && !$1) {
    return new Error(
      "Invalid date: " + ("day " + to_string2(day2) + " is out of range") + (" (1 to " + to_string2(
        days_in_month(year2, number_to_month(month_number2))
      ) + ")") + (" for " + (() => {
        let _pipe = month_number2;
        let _pipe$1 = number_to_month(_pipe);
        return month_to_name(_pipe$1);
      })()) + (() => {
        let $2 = month_number2 === 2 && day2 === 29;
        if ($2) {
          return " (" + to_string2(year2) + " is not a leap year)";
        } else {
          return "";
        }
      })() + ("; received (year " + to_string2(year2) + ", month " + to_string2(
        month_number2
      ) + ", day " + to_string2(day2) + ")")
    );
  } else {
    return new Ok(
      new RD(
        days_before_year(year2) + days_before_month(
          year2,
          number_to_month(month_number2)
        ) + day2
      )
    );
  }
}
function from_week_parts(week_year2, week_number2, weekday_number2) {
  let weeks_in_year = (() => {
    let $2 = is_53_week_year(week_year2);
    if ($2) {
      return 53;
    } else {
      return 52;
    }
  })();
  let $ = is_between_int(week_number2, 1, weeks_in_year);
  let $1 = is_between_int(weekday_number2, 1, 7);
  if (!$) {
    return new Error(
      "Invalid week date: " + ("week " + to_string2(week_number2) + " is out of range") + (" (1 to " + to_string2(
        weeks_in_year
      ) + ")") + (" for " + to_string2(week_year2)) + ("; received (year " + to_string2(
        week_year2
      ) + ", week " + to_string2(week_number2) + ", weekday " + to_string2(
        weekday_number2
      ) + ")")
    );
  } else if ($ && !$1) {
    return new Error(
      "Invalid week date: " + ("weekday " + to_string2(weekday_number2) + " is out of range") + " (1 to 7)" + ("; received (year " + to_string2(
        week_year2
      ) + ", week " + to_string2(week_number2) + ", weekday " + to_string2(
        weekday_number2
      ) + ")")
    );
  } else {
    return new Ok(
      new RD(
        days_before_week_year(week_year2) + (week_number2 - 1) * 7 + weekday_number2
      )
    );
  }
}
function from_year_and_day_of_year(year2, day_of_year) {
  if (day_of_year instanceof MonthAndDay) {
    let month_number$1 = day_of_year[0];
    let day$1 = day_of_year[1];
    return from_calendar_parts(year2, month_number$1, day$1);
  } else if (day_of_year instanceof WeekAndWeekday) {
    let week_number$1 = day_of_year[0];
    let weekday_number$1 = day_of_year[1];
    return from_week_parts(year2, week_number$1, weekday_number$1);
  } else {
    let ordinal_day$1 = day_of_year[0];
    return from_ordinal_parts(year2, ordinal_day$1);
  }
}
function parser2() {
  return do$(
    int_4(),
    (year2) => {
      return do$(
        parse_day_of_year(),
        (day_of_year) => {
          return return$(from_year_and_day_of_year(year2, day_of_year));
        }
      );
    }
  );
}
function from_iso_string(str) {
  let $ = run(str, lexer());
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "rada/date",
      950,
      "from_iso_string",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  let tokens = $[0];
  let result = run2(
    tokens,
    (() => {
      let _pipe = parser2();
      return then$3(
        _pipe,
        (val) => {
          return one_of(
            toList([
              (() => {
                let _pipe$1 = eof();
                return then$3(
                  _pipe$1,
                  (_) => {
                    return succeed(val);
                  }
                );
              })(),
              (() => {
                let _pipe$1 = token2(new TimeToken());
                return then$3(
                  _pipe$1,
                  (_) => {
                    return succeed(
                      new Error("Expected a date only, not a date and time")
                    );
                  }
                );
              })(),
              succeed(new Error("Expected a date only"))
            ])
          );
        }
      );
    })()
  );
  if (result.isOk() && result[0].isOk()) {
    let value = result[0][0];
    return new Ok(value);
  } else if (result.isOk() && !result[0].isOk()) {
    let err = result[0][0];
    return new Error(err);
  } else {
    return new Error("Expected a date in ISO 8601 format");
  }
}

// build/dev/javascript/gleam_http/gleam/http.mjs
var Get = class extends CustomType {
};
var Post = class extends CustomType {
};
var Head = class extends CustomType {
};
var Put = class extends CustomType {
};
var Delete = class extends CustomType {
};
var Trace = class extends CustomType {
};
var Connect = class extends CustomType {
};
var Options2 = class extends CustomType {
};
var Patch = class extends CustomType {
};
var Http = class extends CustomType {
};
var Https = class extends CustomType {
};
function method_to_string(method) {
  if (method instanceof Connect) {
    return "connect";
  } else if (method instanceof Delete) {
    return "delete";
  } else if (method instanceof Get) {
    return "get";
  } else if (method instanceof Head) {
    return "head";
  } else if (method instanceof Options2) {
    return "options";
  } else if (method instanceof Patch) {
    return "patch";
  } else if (method instanceof Post) {
    return "post";
  } else if (method instanceof Put) {
    return "put";
  } else if (method instanceof Trace) {
    return "trace";
  } else {
    let s = method[0];
    return s;
  }
}
function scheme_to_string(scheme) {
  if (scheme instanceof Http) {
    return "http";
  } else {
    return "https";
  }
}
function scheme_from_string(scheme) {
  let $ = lowercase2(scheme);
  if ($ === "http") {
    return new Ok(new Http());
  } else if ($ === "https") {
    return new Ok(new Https());
  } else {
    return new Error(void 0);
  }
}

// build/dev/javascript/gleam_http/gleam/http/request.mjs
var Request = class extends CustomType {
  constructor(method, headers, body, scheme, host, port, path2, query) {
    super();
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.path = path2;
    this.query = query;
  }
};
function to_uri(request) {
  return new Uri(
    new Some(scheme_to_string(request.scheme)),
    new None(),
    new Some(request.host),
    request.port,
    request.path,
    request.query,
    new None()
  );
}
function from_uri(uri) {
  return then$(
    (() => {
      let _pipe = uri.scheme;
      let _pipe$1 = unwrap(_pipe, "");
      return scheme_from_string(_pipe$1);
    })(),
    (scheme) => {
      return then$(
        (() => {
          let _pipe = uri.host;
          return to_result(_pipe, void 0);
        })(),
        (host) => {
          let req = new Request(
            new Get(),
            toList([]),
            "",
            scheme,
            host,
            uri.port,
            uri.path,
            uri.query
          );
          return new Ok(req);
        }
      );
    }
  );
}
function to(url) {
  let _pipe = url;
  let _pipe$1 = parse2(_pipe);
  return then$(_pipe$1, from_uri);
}

// build/dev/javascript/gleam_http/gleam/http/response.mjs
var Response = class extends CustomType {
  constructor(status, headers, body) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
};

// build/dev/javascript/gleam_javascript/gleam_javascript_ffi.mjs
var PromiseLayer = class _PromiseLayer {
  constructor(promise) {
    this.promise = promise;
  }
  static wrap(value) {
    return value instanceof Promise ? new _PromiseLayer(value) : value;
  }
  static unwrap(value) {
    return value instanceof _PromiseLayer ? value.promise : value;
  }
};
function resolve(value) {
  return Promise.resolve(PromiseLayer.wrap(value));
}
function then(promise, fn) {
  return promise.then((value) => fn(PromiseLayer.unwrap(value)));
}
function map_promise(promise, fn) {
  return promise.then(
    (value) => PromiseLayer.wrap(fn(PromiseLayer.unwrap(value)))
  );
}
function rescue(promise, fn) {
  return promise.catch((error) => fn(error));
}

// build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs
function tap(promise, callback) {
  let _pipe = promise;
  return map_promise(
    _pipe,
    (a2) => {
      callback(a2);
      return a2;
    }
  );
}
function try_await(promise, callback) {
  let _pipe = promise;
  return then(
    _pipe,
    (result) => {
      if (result.isOk()) {
        let a2 = result[0];
        return callback(a2);
      } else {
        let e = result[0];
        return resolve(new Error(e));
      }
    }
  );
}

// build/dev/javascript/gleam_fetch/ffi.mjs
async function raw_send(request) {
  try {
    return new Ok(await fetch(request));
  } catch (error) {
    return new Error(new NetworkError(error.toString()));
  }
}
function from_fetch_response(response) {
  return new Response(
    response.status,
    List.fromArray([...response.headers]),
    response
  );
}
function to_fetch_request(request) {
  let url = to_string6(to_uri(request));
  let method = method_to_string(request.method).toUpperCase();
  let options = {
    headers: make_headers(request.headers),
    method
  };
  if (method !== "GET" && method !== "HEAD")
    options.body = request.body;
  return new globalThis.Request(url, options);
}
function make_headers(headersList) {
  let headers = new globalThis.Headers();
  for (let [k, v] of headersList)
    headers.append(k.toLowerCase(), v);
  return headers;
}
async function read_text_body(response) {
  let body;
  try {
    body = await response.body.text();
  } catch (error) {
    return new Error(new UnableToReadBody());
  }
  return new Ok(response.withFields({ body }));
}

// build/dev/javascript/gleam_fetch/gleam/fetch.mjs
var NetworkError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var UnableToReadBody = class extends CustomType {
};
function send(request) {
  let _pipe = request;
  let _pipe$1 = to_fetch_request(_pipe);
  let _pipe$2 = raw_send(_pipe$1);
  return try_await(
    _pipe$2,
    (resp) => {
      return resolve(new Ok(from_fetch_response(resp)));
    }
  );
}

// build/dev/javascript/lustre_http/lustre_http.mjs
var BadUrl = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var InternalServerError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var JsonError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var NetworkError2 = class extends CustomType {
};
var NotFound = class extends CustomType {
};
var OtherError = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Unauthorized = class extends CustomType {
};
var ExpectTextResponse = class extends CustomType {
  constructor(run3) {
    super();
    this.run = run3;
  }
};
function do_send(req, expect, dispatch) {
  let _pipe = send(req);
  let _pipe$1 = try_await(_pipe, read_text_body);
  let _pipe$2 = map_promise(
    _pipe$1,
    (response) => {
      if (response.isOk()) {
        let res = response[0];
        return expect.run(new Ok(res));
      } else {
        return expect.run(new Error(new NetworkError2()));
      }
    }
  );
  let _pipe$3 = rescue(
    _pipe$2,
    (_) => {
      return expect.run(new Error(new NetworkError2()));
    }
  );
  tap(_pipe$3, dispatch);
  return void 0;
}
function get2(url, expect) {
  return from2(
    (dispatch) => {
      let $ = to(url);
      if ($.isOk()) {
        let req = $[0];
        return do_send(req, expect, dispatch);
      } else {
        return dispatch(expect.run(new Error(new BadUrl(url))));
      }
    }
  );
}
function response_to_result(response) {
  if (response instanceof Response && (200 <= response.status && response.status <= 299)) {
    let status = response.status;
    let body = response.body;
    return new Ok(body);
  } else if (response instanceof Response && response.status === 401) {
    return new Error(new Unauthorized());
  } else if (response instanceof Response && response.status === 404) {
    return new Error(new NotFound());
  } else if (response instanceof Response && response.status === 500) {
    let body = response.body;
    return new Error(new InternalServerError(body));
  } else {
    let code = response.status;
    let body = response.body;
    return new Error(new OtherError(code, body));
  }
}
function expect_json(decoder, to_msg) {
  return new ExpectTextResponse(
    (response) => {
      let _pipe = response;
      let _pipe$1 = then$(_pipe, response_to_result);
      let _pipe$2 = then$(
        _pipe$1,
        (body) => {
          let $ = decode2(body, decoder);
          if ($.isOk()) {
            let json = $[0];
            return new Ok(json);
          } else {
            let json_error = $[0];
            return new Error(new JsonError(json_error));
          }
        }
      );
      return to_msg(_pipe$2);
    }
  );
}

// build/dev/javascript/web/web/types.mjs
var GitHubProjectRemoteInfo = class extends CustomType {
  constructor(full_name, stars, language, description) {
    super();
    this.full_name = full_name;
    this.stars = stars;
    this.language = language;
    this.description = description;
  }
};
var Home = class extends CustomType {
};
var Projects = class extends CustomType {
};
var Articles = class extends CustomType {
};
var OnRouteChange = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var OnGotGitHubProject = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Model = class extends CustomType {
  constructor(route, projects) {
    super();
    this.route = route;
    this.projects = projects;
  }
};
var Owner = class extends CustomType {
};
var Work = class extends CustomType {
};
var Other2 = class extends CustomType {
};
var Changes = class extends CustomType {
};
var Commits = class extends CustomType {
};
var GenericProject = class extends CustomType {
  constructor(name, desc, repo_url, langs, contrib_desc, contrib_link, project_type) {
    super();
    this.name = name;
    this.desc = desc;
    this.repo_url = repo_url;
    this.langs = langs;
    this.contrib_desc = contrib_desc;
    this.contrib_link = contrib_link;
    this.project_type = project_type;
  }
};
var GithubProject = class extends CustomType {
  constructor(name, org, contrib_desc, project_type, show_contrib, remote_info) {
    super();
    this.name = name;
    this.org = org;
    this.contrib_desc = contrib_desc;
    this.project_type = project_type;
    this.show_contrib = show_contrib;
    this.remote_info = remote_info;
  }
};
var Article = class extends CustomType {
  constructor(name, url, date) {
    super();
    this.name = name;
    this.url = url;
    this.date = date;
  }
};

// build/dev/javascript/web/web/utils.mjs
function mk_page_title(title) {
  return div(
    toList([class$("grid pt-2 pb-6 justify-items-center")]),
    toList([h1(toList([class$("text-3xl font-bold")]), toList([text2(title)]))])
  );
}
function mk_link(link, link_text) {
  return a(
    toList([class$("text-indigo-500"), href(link)]),
    toList([text2(link_text)])
  );
}

// build/dev/javascript/web/web/articles.mjs
function time_fromstr(time) {
  let $ = (() => {
    let _pipe = time;
    return from_iso_string(_pipe);
  })();
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "web/articles",
      9,
      "time_fromstr",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  let parsed = $[0];
  return parsed;
}
function articles() {
  return toList([
    new Article(
      "Zuul Hands on - part 2 - Your first gated patch with Zuul",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-2-your-first-gated-patch-with-zuul.html",
      (() => {
        let _pipe = "2018-09-17";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Zuul Hands on - part 3 - Use the Zuul jobs library",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-3-use-the-zuul-jobs-library.html",
      (() => {
        let _pipe = "2018-09-20";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Zuul Hands on - part 4 - The gate pipeline",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-4-the-gate-pipeline.html",
      (() => {
        let _pipe = "2018-10-02";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      " Zuul Hands on - part 5 - Job Secrets",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-5-job-secrets.html",
      (() => {
        let _pipe = "2018-11-20";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Zuul Pagure Driver Update",
      "https://www.softwarefactory-project.io/zuul-pagure-driver-update.html",
      (() => {
        let _pipe = "2018-12-18";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "CI/CD workflow offered by Zuul/Nodepool on Software Factory",
      "https://www.softwarefactory-project.io/cicd-workflow-offered-by-zuulnodepool-on-software-factory.html",
      (() => {
        let _pipe = "2019-01-31";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Using Dhall to generate Fedora CI Zuul config",
      "https://www.softwarefactory-project.io/using-dhall-to-generate-fedora-ci-zuul-config.html",
      (() => {
        let _pipe = "2021-01-10";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Introduction to </> htmx through a Simple WEB chat application",
      "https://www.softwarefactory-project.io/introduction-to-htmx-through-a-simple-web-chat-application.html",
      (() => {
        let _pipe = "2022-09-26";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Howto manage shareable, reproducible Nix environments via nix-shell",
      "https://www.softwarefactory-project.io/howto-manage-shareable-reproducible-nix-environments-via-nix-shell.html",
      (() => {
        let _pipe = "2023-01-24";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Reproducible Shell environments via Nix Flakes",
      "https://www.softwarefactory-project.io/reproducible-shell-environments-via-nix-flakes.html",
      (() => {
        let _pipe = "2023-01-24";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Monocle Operator - Phase 1 - Basic Install",
      "https://www.softwarefactory-project.io/monocle-operator-phase-1-basic-install.html",
      (() => {
        let _pipe = "2023-03-10";
        return time_fromstr(_pipe);
      })()
    ),
    new Article(
      "Monocle Operator - OLM",
      "https://www.softwarefactory-project.io/monocle-operator-olm.html",
      (() => {
        let _pipe = "2023-05-15";
        return time_fromstr(_pipe);
      })()
    )
  ]);
}
function view_article(article) {
  return div(
    toList([class$("flex gap-1")]),
    toList([
      div(
        toList([class$("basis-2/12")]),
        toList([
          (() => {
            let _pipe = article.date;
            let _pipe$1 = to_iso_string(_pipe);
            return text2(_pipe$1);
          })()
        ])
      ),
      div(
        toList([class$("basis-10/12")]),
        toList([mk_link(article.url, article.name)])
      )
    ])
  );
}
function view_articles(_) {
  return div(
    toList([]),
    toList([
      div(toList([]), toList([mk_page_title("Articles")])),
      div(
        toList([]),
        toList([
          div(
            toList([class$("flex flex-col gap-2")]),
            (() => {
              let _pipe = articles();
              let _pipe$1 = sort(
                _pipe,
                (a2, b) => {
                  return compare3(b.date, a2.date);
                }
              );
              return map2(_pipe$1, view_article);
            })()
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/web/web/home.mjs
function view_home(_) {
  return div(
    toList([]),
    toList([
      mk_page_title("Welcome on my web page"),
      div(
        toList([class$("flex flex-col gap-2")]),
        toList([
          div(
            toList([class$("self-center")]),
            toList([
              img(
                toList([
                  class$("rounded-full w-32 h-32"),
                  src("https://avatars.githubusercontent.com/u/84583")
                ])
              )
            ])
          ),
          div(
            toList([class$("flex flex-col gap-2")]),
            toList([
              p(
                toList([]),
                toList([
                  text2(
                    "My name is Fabien Boucher, I'm currenlty working for Red Hat as a Principal Software Engineer."
                  ),
                  text2(
                    " At work, I maintain the production chain CI infrastructure for OSP (the Red Hat OpenStack Platform) and for"
                  ),
                  mk_link("https://www.rdoproject.org", " RDO"),
                  text2(". I contribute to"),
                  mk_link("/projects", " various Open Source projects "),
                  text2("for work and during my free time.")
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/lustre/lustre/element/svg.mjs
var namespace = "http://www.w3.org/2000/svg";
function svg(attrs, children) {
  return namespaced(namespace, "svg", attrs, children);
}
function path(attrs) {
  return namespaced(namespace, "path", attrs, toList([]));
}

// build/dev/javascript/web/web/github.mjs
function build_full_name(org, name) {
  return org + "/" + name;
}
function mk_changes_url(name, org) {
  return "https://github.com/" + build_full_name(org, name) + "/pulls?q=is%3Apr+is%3Aclosed+author%3Amorucci+";
}
function get_project(name, org) {
  debug("fetching remote infos for " + build_full_name(org, name));
  let decoder = decode4(
    (var0, var1, var2, var3) => {
      return new GitHubProjectRemoteInfo(var0, var1, var2, var3);
    },
    field("full_name", string),
    field("stargazers_count", int),
    field("language", string),
    field("description", optional(string))
  );
  let url = "https://api.github.com/repos/" + org + "/" + name;
  return get2(
    url,
    expect_json(
      decoder,
      (var0) => {
        return new OnGotGitHubProject(var0);
      }
    )
  );
}

// build/dev/javascript/web/web/projects.mjs
function change_svg() {
  let xmlns = attribute("xmlns", "http://www.w3.org/2000/svg");
  let width = attribute("width", "1em");
  let height = attribute("height", "1em");
  let viewbox = attribute("viewBox", "0 0 24 24");
  let fill = attribute("fill", "currentColor");
  let d1 = attribute(
    "d",
    "M16 19.25a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0m-14.5 0a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0m0-14.5a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M4.75 3a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 3m0 14.5a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 17.5m14.5 0a1.75 1.75 0 1 0 .001 3.501a1.75 1.75 0 0 0-.001-3.501"
  );
  let d2 = attribute(
    "d",
    "M13.405 1.72a.75.75 0 0 1 0 1.06L12.185 4h4.065A3.75 3.75 0 0 1 20 7.75v8.75a.75.75 0 0 1-1.5 0V7.75a2.25 2.25 0 0 0-2.25-2.25h-4.064l1.22 1.22a.75.75 0 0 1-1.061 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0M4.75 7.25A.75.75 0 0 1 5.5 8v8A.75.75 0 0 1 4 16V8a.75.75 0 0 1 .75-.75"
  );
  return svg(
    toList([xmlns, width, height, viewbox]),
    toList([path(toList([fill, d1])), path(toList([fill, d2]))])
  );
}
function mk_changes_link(link) {
  return a(
    toList([class$("text-indigo-500"), href(link)]),
    toList([change_svg()])
  );
}
function list() {
  return toList([
    new GithubProject(
      "monocle",
      "change-metrics",
      "I started this project and I'm on of the main contributors of this project. The project has been initially started in Python, then for the fun and with the help of a colleague we migrated the code to Haskell.",
      new Owner(),
      new Some(new Changes()),
      new None()
    ),
    new GithubProject(
      "repoxplorer",
      "morucci",
      "I started this project and was the main contribution on it",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GenericProject(
      "Software Factory",
      " This project help us to maintain a development forge with Zuul as the main component for the CI/CD",
      "https://www.softwarefactory-project.io",
      toList(["Ansible", "Python"]),
      "I'm working on this project with my co-workers. It is an infrastucture project and I used to provide improvements on the code base.",
      new Some(
        "https://softwarefactory-project.io/r/q/(projects:%2522software-factory%2522+author:%2522Fabien+Boucher%2522+status:merged)+AND+NOT+project:software-factory/sf-operator"
      ),
      new Work()
    ),
    new GithubProject(
      "sf-operator",
      "softwarefactory-project",
      "I'm currently actively working on that project with the help of my co-workers.",
      new Work(),
      new Some(new Commits()),
      new None()
    ),
    new GenericProject(
      "Zuul CI",
      "This an Opendev's project initialy developed for the OpenStack project CI.",
      "https://opendev.org/zuul/zuul",
      toList(["Python", "TypeScript"]),
      "I've contributed several improvment to Zuul, mainly the Git, Pagure, ElasticSearch and GitLab driver",
      new Some(
        "https://review.opendev.org/q/project:+zuul/zuul+author:%22Fabien+Boucher%22+status:merged"
      ),
      new Work()
    ),
    new GithubProject(
      "HazardHunter",
      "web-apps-lab",
      "Wanted to challenge myself to leverage HTMX via ButlerOS.",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GithubProject(
      "MemoryMaster",
      "web-apps-lab",
      "A second game after HazardHunter and because it was fun to build.",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GithubProject(
      "FreeSnaky",
      "morucci",
      "A challenge to learn more about Haskell, the Brick engine and capability to have the whole game logic handled server side and the terminal UI to be just a dumb display.",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GithubProject(
      "schat",
      "morucci",
      "This is a learning project around Haskell and HTMX.",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GithubProject(
      "bbot",
      "morucci",
      "A little project I've wrote mainly to learn about OCaml.",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GenericProject(
      "FM gateway",
      "Gateway to send fedora-messaging messages to the Zuul Pagure driver web-hook service.",
      "https://pagure.io/fm-gateway",
      toList(["Python"]),
      "I've build that project to solve an integration issue between Zuul and the Fedora Pagure Forge",
      new Some(
        "https://pagure.io/fm-gateway/commits?author=fboucher@redhat.com"
      ),
      new Work()
    ),
    new GithubProject(
      "pidstat-grapher",
      "morucci",
      "Project I wrote due to a need to plot system processes resources consumption",
      new Owner(),
      new Some(new Commits()),
      new None()
    ),
    new GenericProject(
      "openstack/swift",
      "Openstack Object Storage",
      "https://opendev.org/openstack/swift",
      toList(["Python"]),
      "I've mainly worked on the Quota middleware.",
      new Some(
        "https://review.opendev.org/q/project:+openstack/swift+author:%22Fabien%20Boucher%22+status:merged"
      ),
      new Work()
    ),
    new GenericProject(
      "zuul-distro-jobs",
      "A library of Zuul jobs for RPM packages build/test integrations",
      "https://pagure.io/zuul-distro-jobs",
      toList(["Ansible"]),
      "I've created that project in order to leverage Zuul CI for RPM based distribution CI purpose",
      new Some(
        "https://pagure.io/zuul-distro-jobs/commits?author=fboucher@redhat.com"
      ),
      new Work()
    ),
    new GenericProject(
      "fedora-project-config",
      "The main Zuul job defintion of Fedora Zuul CI",
      "https://pagure.io/fedora-project-config",
      toList(["Ansible", "Dhall"]),
      "I've initialized this project, based on Zuul and zuul-distro-jobs, to provide CI jobs for validating Fedora packaging.",
      new Some(
        "https://pagure.io/fedora-project-config/commits?author=fboucher@redhat.com"
      ),
      new Work()
    ),
    new GithubProject(
      "dulwich",
      "jelmer",
      "I contributed a GIT store backend based on an OpenStack Swift object store.",
      new Other2(),
      new Some(new Changes()),
      new None()
    ),
    new GithubProject(
      "haskell-butler",
      "ButlerOS",
      "I contributed a login system based on OpenID Connect.",
      new Other2(),
      new Some(new Changes()),
      new None()
    )
  ]);
}
function get_project2(project) {
  if (project instanceof GenericProject) {
    return none();
  } else if (project instanceof GithubProject && project.remote_info instanceof Some) {
    let name = project.name;
    let org = project.org;
    debug(
      "remote infos for alreay for " + build_full_name(org, name) + " already in app state"
    );
    return none();
  } else {
    let name = project.name;
    let org = project.org;
    return get_project(name, org);
  }
}
function view_project(project) {
  if (project instanceof GenericProject) {
    let name = project.name;
    let desc = project.desc;
    let repo_url = project.repo_url;
    let langs = project.langs;
    let contrib_desc = project.contrib_desc;
    let contrib_link = project.contrib_link;
    return div(
      toList([]),
      toList([
        div(
          toList([class$("flex justify-between")]),
          toList([
            mk_link(repo_url, name),
            div(
              toList([class$("flex flex-row gap-2")]),
              toList([
                (() => {
                  if (contrib_link instanceof Some) {
                    let link = contrib_link[0];
                    return mk_changes_link(link);
                  } else {
                    return none2();
                  }
                })(),
                div(
                  toList([]),
                  toList([
                    (() => {
                      let _pipe = langs;
                      let _pipe$1 = join2(_pipe, "/");
                      return text2(_pipe$1);
                    })()
                  ])
                )
              ])
            )
          ])
        ),
        div(
          toList([class$("grid gap-1")]),
          toList([
            div(toList([]), toList([text2(desc)])),
            div(toList([]), toList([text2(contrib_desc)]))
          ])
        )
      ])
    );
  } else if (project instanceof GithubProject && project.remote_info instanceof Some) {
    let name = project.name;
    let org = project.org;
    let contrib_desc = project.contrib_desc;
    let show_changes = project.show_contrib;
    let ri = project.remote_info[0];
    return div(
      toList([]),
      toList([
        div(
          toList([class$("flex justify-between")]),
          toList([
            div(
              toList([class$("flex gap-1")]),
              toList([
                mk_link("https://github.com/" + org + "/" + name, name)
              ])
            ),
            div(
              toList([class$("flex flex-row gap-2")]),
              toList([
                (() => {
                  if (show_changes instanceof Some && show_changes[0] instanceof Changes) {
                    return div(
                      toList([]),
                      toList([
                        mk_changes_link(mk_changes_url(name, org))
                      ])
                    );
                  } else if (show_changes instanceof Some && show_changes[0] instanceof Commits) {
                    return div(
                      toList([]),
                      toList([
                        mk_changes_link(mk_changes_url(name, org))
                      ])
                    );
                  } else {
                    return none2();
                  }
                })(),
                div(
                  toList([]),
                  toList([
                    text2(
                      (() => {
                        let _pipe = ri.stars;
                        return to_string2(_pipe);
                      })() + "\u2B50"
                    )
                  ])
                ),
                div(toList([]), toList([text2(ri.language)]))
              ])
            )
          ])
        ),
        div(
          toList([class$("grid gap-1")]),
          toList([
            div(
              toList([]),
              toList([
                text2(
                  (() => {
                    let _pipe = ri.description;
                    return unwrap(_pipe, "No description");
                  })()
                )
              ])
            ),
            div(toList([]), toList([text2(contrib_desc)]))
          ])
        )
      ])
    );
  } else {
    return none2();
  }
}
function view_projects(model) {
  let section_title = (title) => {
    return h2(
      toList([class$("text-2xl font-bold text-blue-100")]),
      toList([text2(title)])
    );
  };
  return div(
    toList([]),
    toList([
      div(toList([]), toList([mk_page_title("Projects")])),
      div(
        toList([class$("grid gap-6")]),
        toList([
          div(
            toList([class$("grid gap-1")]),
            toList([
              section_title("Projects I have originaly created"),
              div(
                toList([class$("grid gap-2")]),
                (() => {
                  let _pipe = model.projects;
                  let _pipe$1 = filter(
                    _pipe,
                    (p2) => {
                      if (p2 instanceof GithubProject && p2.project_type instanceof Owner) {
                        return true;
                      } else if (p2 instanceof GenericProject && p2.project_type instanceof Owner) {
                        return true;
                      } else {
                        return false;
                      }
                    }
                  );
                  return map2(_pipe$1, view_project);
                })()
              )
            ])
          ),
          div(
            toList([class$("grid gap-1")]),
            toList([
              section_title("Projects I've contributed to for my employer"),
              div(
                toList([class$("grid gap-2")]),
                (() => {
                  let _pipe = model.projects;
                  let _pipe$1 = filter(
                    _pipe,
                    (p2) => {
                      if (p2 instanceof GithubProject && p2.project_type instanceof Work) {
                        return true;
                      } else if (p2 instanceof GenericProject && p2.project_type instanceof Work) {
                        return true;
                      } else {
                        return false;
                      }
                    }
                  );
                  return map2(_pipe$1, view_project);
                })()
              )
            ])
          ),
          div(
            toList([class$("grid gap-1")]),
            toList([
              section_title("Projects I've contributed on my free time"),
              div(
                toList([class$("grid gap-2")]),
                (() => {
                  let _pipe = model.projects;
                  let _pipe$1 = filter(
                    _pipe,
                    (p2) => {
                      if (p2 instanceof GithubProject && p2.project_type instanceof Other2) {
                        return true;
                      } else if (p2 instanceof GenericProject && p2.project_type instanceof Other2) {
                        return true;
                      } else {
                        return false;
                      }
                    }
                  );
                  return map2(_pipe$1, view_project);
                })()
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/web/web/routes.mjs
function uri_to_route(uri) {
  let $ = path_segments(uri.path);
  if ($.hasLength(1) && $.head === "projects") {
    return new Projects();
  } else if ($.hasLength(1) && $.head === "articles") {
    return new Articles();
  } else {
    return new Home();
  }
}
function on_url_change(uri) {
  return new OnRouteChange(uri_to_route(uri));
}

// build/dev/javascript/web/web.mjs
function init3(_) {
  let route = (() => {
    let $ = do_initial_uri();
    if ($.isOk()) {
      let uri = $[0];
      return uri_to_route(uri);
    } else {
      return new Home();
    }
  })();
  return [
    new Model(route, list()),
    (() => {
      let _pipe = list();
      let _pipe$1 = map2(_pipe, get_project2);
      let _pipe$2 = append2(_pipe$1, toList([init2(on_url_change)]));
      return batch(_pipe$2);
    })()
  ];
}
function update(model, msg) {
  if (msg instanceof OnRouteChange) {
    let route = msg[0];
    return [
      model.withFields({ route }),
      (() => {
        if (route instanceof Projects) {
          let _pipe = model.projects;
          let _pipe$1 = map2(_pipe, get_project2);
          return batch(_pipe$1);
        } else {
          return none();
        }
      })()
    ];
  } else if (msg instanceof OnGotGitHubProject && msg[0].isOk()) {
    let remote_project_info = msg[0][0];
    let update_project = (project) => {
      if (project instanceof GithubProject) {
        let name = project.name;
        let org = project.org;
        let contrib_desc = project.contrib_desc;
        let owner = project.project_type;
        let show_changes = project.show_contrib;
        let $ = org + "/" + name === remote_project_info.full_name;
        if ($) {
          return new GithubProject(
            name,
            org,
            contrib_desc,
            owner,
            show_changes,
            new Some(remote_project_info)
          );
        } else {
          return project;
        }
      } else {
        return project;
      }
    };
    return [
      model.withFields({
        projects: (() => {
          let _pipe = model.projects;
          return map2(_pipe, update_project);
        })()
      }),
      none()
    ];
  } else {
    let err = msg[0][0];
    debug(err);
    return [model, none()];
  }
}
function view(model) {
  return div(
    toList([
      class$(
        "flex flex-row justify-center min-h-screen bg-zinc-800 text-teal-200"
      )
    ]),
    toList([
      div(
        toList([class$("basis-10/12")]),
        toList([
          div(
            toList([class$("pt-1 w-full max-w-5xl mx-auto")]),
            toList([
              div(
                toList([class$("p-1 border-2 border-indigo-500 bg-zinc-900")]),
                toList([
                  nav(
                    toList([class$("flex gap-2")]),
                    toList([
                      mk_link("/", "Home"),
                      mk_link("/projects", "Projects"),
                      mk_link("/articles", "Articles")
                    ])
                  )
                ])
              ),
              (() => {
                let $ = model.route;
                if ($ instanceof Home) {
                  return view_home(model);
                } else if ($ instanceof Projects) {
                  return view_projects(model);
                } else {
                  return view_articles(model);
                }
              })()
            ])
          )
        ])
      )
    ])
  );
}
function main() {
  let app = application(init3, update, view);
  let $ = start3(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "web",
      21,
      "main",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
