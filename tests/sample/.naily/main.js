import { B as Bean, N as NailyBeanFactory, _ as __decorate, a as NailyBeanRegistry, b as __metadata, T as TestService } from './test.service-KJtL1lho.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

class NailyDecoratorFactory {
    static applyDecorators(...decorators) {
        return (target, propertyKey, descriptor) => {
            for (const decorator of decorators) {
                if (target instanceof Function && !descriptor) {
                    decorator(target);
                    continue;
                }
                decorator(target, propertyKey, descriptor);
            }
        };
    }
    static applyClassDecorators(...decorators) {
        return (target) => {
            for (const decorator of decorators) {
                decorator(target);
            }
        };
    }
    static applyMethodDecorators(...decorators) {
        return (target, propertyKey, descriptor) => {
            for (const decorator of decorators) {
                decorator(target, propertyKey, descriptor);
            }
        };
    }
    static applyPropertyDecorators(...decorators) {
        return (target, propertyKey) => {
            for (const decorator of decorators) {
                decorator(target, propertyKey);
            }
        };
    }
    static applyParameterDecorators(...decorators) {
        return (target, propertyKey, parameterIndex) => {
            for (const decorator of decorators) {
                decorator(target, propertyKey, parameterIndex);
            }
        };
    }
    static createPropertyDecorator(factory = {}) {
        return (target, propertyKey) => {
            const options = factory.before ? factory.before(target, propertyKey) : {};
            Bean(options)(target, propertyKey);
            factory.after ? factory.after(target, propertyKey, options) : undefined;
        };
    }
    static createClassDecorator(factory = {}) {
        return (target) => {
            const options = factory.before ? factory.before(target) : {};
            Bean(options)(target);
            factory.after ? factory.after(target, options) : undefined;
        };
    }
    static createMethodDecorator(factory = {}) {
        return (target, propertyKey, descriptor) => {
            const options = factory.before ? factory.before(target, propertyKey, descriptor) : {};
            Bean(options)(target, propertyKey);
            factory.after ? factory.after(target, propertyKey, descriptor, options) : undefined;
        };
    }
}

function Injectable(options = {}) {
    return NailyDecoratorFactory.createClassDecorator({
        before() {
            return options;
        },
    });
}

function Inject(val, extraBeanOptions) {
    return NailyDecoratorFactory.createPropertyDecorator({
        before() {
            return extraBeanOptions;
        },
        after(target, propertyKey) {
            Reflect.defineMetadata("__naily:inject__" /* NailyWatermark.INJECT */, val, target, propertyKey);
            Object.defineProperty(target, propertyKey, {
                get() {
                    return new NailyBeanFactory(val).createInstance();
                },
            });
        },
    });
}
function Autowired(extraBeanOptions) {
    return (target, propertyKey) => {
        const typing = Reflect.getMetadata("design:type", target, propertyKey);
        if (!typing)
            throw new Error("No typing found");
        Inject(typing, extraBeanOptions)(target, propertyKey);
    };
}

const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR$1 = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR$1;
const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
function isNode(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR$1:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove node');
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        visit_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current node */
visit.SKIP = SKIP;
/** Remove the current node */
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (isNode(ctrl) || isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if (isCollection(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = visit_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if (isPair(node)) {
            path = Object.freeze(path.concat(node));
            const ck = visit_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = visit_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
function initVisitor(visitor) {
    if (typeof visitor === 'object' &&
        (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
            Alias: visitor.Node,
            Map: visitor.Node,
            Scalar: visitor.Node,
            Seq: visitor.Node
        }, visitor.Value && {
            Map: visitor.Value,
            Scalar: visitor.Value,
            Seq: visitor.Value
        }, visitor.Collection && {
            Map: visitor.Collection,
            Seq: visitor.Collection
        }, visitor);
    }
    return visitor;
}
function callVisitor(key, node, visitor, path) {
    if (typeof visitor === 'function')
        return visitor(key, node, path);
    if (isMap(node))
        return visitor.Map?.(key, node, path);
    if (isSeq(node))
        return visitor.Seq?.(key, node, path);
    if (isPair(node))
        return visitor.Pair?.(key, node, path);
    if (isScalar(node))
        return visitor.Scalar?.(key, node, path);
    if (isAlias(node))
        return visitor.Alias?.(key, node, path);
    return undefined;
}
function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (isCollection(parent)) {
        parent.items[key] = node;
    }
    else if (isPair(parent)) {
        if (key === 'key')
            parent.key = node;
        else
            parent.value = node;
    }
    else if (isDocument(parent)) {
        parent.contents = node;
    }
    else {
        const pt = isAlias(parent) ? 'alias' : 'scalar';
        throw new Error(`Cannot replace node with ${pt} parent`);
    }
}

const escapeChars = {
    '!': '%21',
    ',': '%2C',
    '[': '%5B',
    ']': '%5D',
    '{': '%7B',
    '}': '%7D'
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
class Directives {
    constructor(yaml, tags) {
        /**
         * The directives-end/doc-start marker `---`. If `null`, a marker may still be
         * included in the document's stringified representation.
         */
        this.docStart = null;
        /** The doc-end marker `...`.  */
        this.docEnd = false;
        this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
        const copy = new Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
        const res = new Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
            case '1.1':
                this.atNextDocument = true;
                break;
            case '1.2':
                this.atNextDocument = false;
                this.yaml = {
                    explicit: Directives.defaultYaml.explicit,
                    version: '1.2'
                };
                this.tags = Object.assign({}, Directives.defaultTags);
                break;
        }
        return res;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(line, onError) {
        if (this.atNextDocument) {
            this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
            this.tags = Object.assign({}, Directives.defaultTags);
            this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
            case '%TAG': {
                if (parts.length !== 2) {
                    onError(0, '%TAG directive should contain exactly two parts');
                    if (parts.length < 2)
                        return false;
                }
                const [handle, prefix] = parts;
                this.tags[handle] = prefix;
                return true;
            }
            case '%YAML': {
                this.yaml.explicit = true;
                if (parts.length !== 1) {
                    onError(0, '%YAML directive should contain exactly one part');
                    return false;
                }
                const [version] = parts;
                if (version === '1.1' || version === '1.2') {
                    this.yaml.version = version;
                    return true;
                }
                else {
                    const isValid = /^\d+\.\d+$/.test(version);
                    onError(6, `Unsupported YAML version ${version}`, isValid);
                    return false;
                }
            }
            default:
                onError(0, `Unknown directive ${name}`, true);
                return false;
        }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(source, onError) {
        if (source === '!')
            return '!'; // non-specific tag
        if (source[0] !== '!') {
            onError(`Not a valid tag: ${source}`);
            return null;
        }
        if (source[1] === '<') {
            const verbatim = source.slice(2, -1);
            if (verbatim === '!' || verbatim === '!!') {
                onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
                return null;
            }
            if (source[source.length - 1] !== '>')
                onError('Verbatim tags must end with a >');
            return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
            onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
            try {
                return prefix + decodeURIComponent(suffix);
            }
            catch (error) {
                onError(String(error));
                return null;
            }
        }
        if (handle === '!')
            return source; // local tag
        onError(`Could not resolve tag: ${source}`);
        return null;
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
            if (tag.startsWith(prefix))
                return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === '!' ? tag : `!<${tag}>`;
    }
    toString(doc) {
        const lines = this.yaml.explicit
            ? [`%YAML ${this.yaml.version || '1.2'}`]
            : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
            const tags = {};
            visit(doc.contents, (_key, node) => {
                if (isNode(node) && node.tag)
                    tags[node.tag] = true;
            });
            tagNames = Object.keys(tags);
        }
        else
            tagNames = [];
        for (const [handle, prefix] of tagEntries) {
            if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
                continue;
            if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
                lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join('\n');
    }
}
Directives.defaultYaml = { explicit: false, version: '1.2' };
Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };

/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
    }
    return true;
}
function anchorNames(root) {
    const anchors = new Set();
    visit(root, {
        Value(_key, node) {
            if (node.anchor)
                anchors.add(node.anchor);
        }
    });
    return anchors;
}
/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
function findNewAnchor(prefix, exclude) {
    for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
            return name;
    }
}
function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map();
    let prevAnchors = null;
    return {
        onAnchor: (source) => {
            aliasObjects.push(source);
            if (!prevAnchors)
                prevAnchors = anchorNames(doc);
            const anchor = findNewAnchor(prefix, prevAnchors);
            prevAnchors.add(anchor);
            return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
            for (const source of aliasObjects) {
                const ref = sourceObjects.get(source);
                if (typeof ref === 'object' &&
                    ref.anchor &&
                    (isScalar(ref.node) || isCollection(ref.node))) {
                    ref.node.anchor = ref.anchor;
                }
                else {
                    const error = new Error('Failed to resolve repeated object (this should not happen)');
                    error.source = source;
                    throw error;
                }
            }
        },
        sourceObjects
    };
}

/**
 * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
 * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
 * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
 *
 * Includes extensions for handling Map and Set objects.
 */
function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            for (let i = 0, len = val.length; i < len; ++i) {
                const v0 = val[i];
                const v1 = applyReviver(reviver, val, String(i), v0);
                if (v1 === undefined)
                    delete val[i];
                else if (v1 !== v0)
                    val[i] = v1;
            }
        }
        else if (val instanceof Map) {
            for (const k of Array.from(val.keys())) {
                const v0 = val.get(k);
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    val.delete(k);
                else if (v1 !== v0)
                    val.set(k, v1);
            }
        }
        else if (val instanceof Set) {
            for (const v0 of Array.from(val)) {
                const v1 = applyReviver(reviver, val, v0, v0);
                if (v1 === undefined)
                    val.delete(v0);
                else if (v1 !== v0) {
                    val.delete(v0);
                    val.add(v1);
                }
            }
        }
        else {
            for (const [k, v0] of Object.entries(val)) {
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    delete val[k];
                else if (v1 !== v0)
                    val[k] = v1;
            }
        }
    }
    return reviver.call(obj, key, val);
}

/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!ctx || !hasAnchor(value))
            return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: undefined };
        ctx.anchors.set(value, data);
        ctx.onCreate = res => {
            data.res = res;
            delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
            ctx.onCreate(res);
        return res;
    }
    if (typeof value === 'bigint' && !ctx?.keep)
        return Number(value);
    return value;
}

class NodeBase {
    constructor(type) {
        Object.defineProperty(this, NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** A plain JavaScript representation of this node. */
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!isDocument(doc))
            throw new TypeError('A document argument is required');
        const ctx = {
            anchors: new Map(),
            doc,
            keep: true,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = toJS(this, '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? applyReviver(reviver, { '': res }, '', res)
            : res;
    }
}

class Alias extends NodeBase {
    constructor(source) {
        super(ALIAS);
        this.source = source;
        Object.defineProperty(this, 'tag', {
            set() {
                throw new Error('Alias nodes cannot have tags');
            }
        });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc) {
        let found = undefined;
        visit(doc, {
            Node: (_key, node) => {
                if (node === this)
                    return visit.BREAK;
                if (node.anchor === this.source)
                    found = node;
            }
        });
        return found;
    }
    toJSON(_arg, ctx) {
        if (!ctx)
            return { source: this.source };
        const { anchors, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc);
        if (!source) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new ReferenceError(msg);
        }
        let data = anchors.get(source);
        if (!data) {
            // Resolve anchors for Node.prototype.toJS()
            toJS(source, null, ctx);
            data = anchors.get(source);
        }
        /* istanbul ignore if */
        if (!data || data.res === undefined) {
            const msg = 'This should not happen: Alias anchor was not resolved?';
            throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
                data.aliasCount = getAliasCount(doc, source, anchors);
            if (data.count * data.aliasCount > maxAliasCount) {
                const msg = 'Excessive alias count indicates a resource exhaustion attack';
                throw new ReferenceError(msg);
            }
        }
        return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
            anchorIsValid(this.source);
            if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new Error(msg);
            }
            if (ctx.implicitKey)
                return `${src} `;
        }
        return src;
    }
}
function getAliasCount(doc, node, anchors) {
    if (isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors && source && anchors.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
    }
    else if (isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
            const c = getAliasCount(doc, item, anchors);
            if (c > count)
                count = c;
        }
        return count;
    }
    else if (isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors);
        const vc = getAliasCount(doc, node.value, anchors);
        return Math.max(kc, vc);
    }
    return 1;
}

const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar extends NodeBase {
    constructor(value) {
        super(SCALAR$1);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
    }
    toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';

const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
    if (tagName) {
        const match = tags.filter(t => t.tag === tagName);
        const tagObj = match.find(t => !t.format) ?? match[0];
        if (!tagObj)
            throw new Error(`Tag ${tagName} not found`);
        return tagObj;
    }
    return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
    if (isDocument(value))
        value = value.contents;
    if (isNode(value))
        return value;
    if (isPair(value)) {
        const map = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
    }
    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        (typeof BigInt !== 'undefined' && value instanceof BigInt) // not supported everywhere
    ) {
        // https://tc39.es/ecma262/#sec-serializejsonproperty
        value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    // Detect duplicate references to the same object & use Alias nodes for all
    // after first. The `ref` wrapper allows for circular references to resolve.
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === 'object') {
        ref = sourceObjects.get(value);
        if (ref) {
            if (!ref.anchor)
                ref.anchor = onAnchor(value);
            return new Alias(ref.anchor);
        }
        else {
            ref = { anchor: null, node: null };
            sourceObjects.set(value, ref);
        }
    }
    if (tagName?.startsWith('!!'))
        tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            value = value.toJSON();
        }
        if (!value || typeof value !== 'object') {
            const node = new Scalar(value);
            if (ref)
                ref.node = node;
            return node;
        }
        tagObj =
            value instanceof Map
                ? schema[MAP]
                : Symbol.iterator in Object(value)
                    ? schema[SEQ]
                    : schema[MAP];
    }
    if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
    }
    const node = tagObj?.createNode
        ? tagObj.createNode(ctx.schema, value, ctx)
        : typeof tagObj?.nodeClass?.from === 'function'
            ? tagObj.nodeClass.from(ctx.schema, value, ctx)
            : new Scalar(value);
    if (tagName)
        node.tag = tagName;
    else if (!tagObj.default)
        node.tag = tagObj.tag;
    if (ref)
        ref.node = node;
    return node;
}

function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
            const a = [];
            a[k] = v;
            v = a;
        }
        else {
            v = new Map([[k, v]]);
        }
    }
    return createNode(v, undefined, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
            throw new Error('This should not happen, please report a bug.');
        },
        schema,
        sourceObjects: new Map()
    });
}
// Type guard is intentionally a little wrong so as to be more useful,
// as it does not cover untypable empty non-string iterables (e.g. []).
const isEmptyPath = (path) => path == null ||
    (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection extends NodeBase {
    constructor(type, schema) {
        super(type);
        Object.defineProperty(this, 'schema', {
            value: schema,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
            copy.schema = schema;
        copy.items = copy.items.map(it => isNode(it) || isPair(it) ? it.clone(schema) : it);
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
        if (isEmptyPath(path))
            this.add(value);
        else {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if (isCollection(node))
                node.addIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.delete(key);
        const node = this.get(key, true);
        if (isCollection(node))
            return node.deleteIn(rest);
        else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
            return !keepScalar && isScalar(node) ? node.value : node;
        else
            return isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
        return this.items.every(node => {
            if (!isPair(node))
                return false;
            const n = node.value;
            return (n == null ||
                (allowScalar &&
                    isScalar(n) &&
                    n.value == null &&
                    !n.commentBefore &&
                    !n.comment &&
                    !n.tag));
        });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.has(key);
        const node = this.get(key, true);
        return isCollection(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
            this.set(key, value);
        }
        else {
            const node = this.get(key, true);
            if (isCollection(node))
                node.setIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
}
Collection.maxFlowStringSingleLineLength = 60;

/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
        return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
    ? indentComment(comment, indent)
    : comment.includes('\n')
        ? '\n' + indentComment(comment, indent)
        : (str.endsWith(' ') ? '' : ' ') + comment;

const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
        return text;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
        return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === 'number') {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
            folds.push(0);
        else
            end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i);
        if (i !== -1)
            end = i + endStep;
    }
    for (let ch; (ch = text[(i += 1)]);) {
        if (mode === FOLD_QUOTED && ch === '\\') {
            escStart = i;
            switch (text[i + 1]) {
                case 'x':
                    i += 3;
                    break;
                case 'u':
                    i += 5;
                    break;
                case 'U':
                    i += 9;
                    break;
                default:
                    i += 1;
            }
            escEnd = i;
        }
        if (ch === '\n') {
            if (mode === FOLD_BLOCK)
                i = consumeMoreIndentedLines(text, i);
            end = i + endStep;
            split = undefined;
        }
        else {
            if (ch === ' ' &&
                prev &&
                prev !== ' ' &&
                prev !== '\n' &&
                prev !== '\t') {
                // space surrounded by non-space can be replaced with newline + indent
                const next = text[i + 1];
                if (next && next !== ' ' && next !== '\n' && next !== '\t')
                    split = i;
            }
            if (i >= end) {
                if (split) {
                    folds.push(split);
                    end = split + endStep;
                    split = undefined;
                }
                else if (mode === FOLD_QUOTED) {
                    // white-space collected at end may stretch past lineWidth
                    while (prev === ' ' || prev === '\t') {
                        prev = ch;
                        ch = text[(i += 1)];
                        overflow = true;
                    }
                    // Account for newline escape, but don't break preceding escape
                    const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                    // Bail out if lineWidth & minContentWidth are shorter than an escape string
                    if (escapedFolds[j])
                        return text;
                    folds.push(j);
                    escapedFolds[j] = true;
                    end = j + endStep;
                    split = undefined;
                }
                else {
                    overflow = true;
                }
            }
        }
        prev = ch;
    }
    if (overflow && onOverflow)
        onOverflow();
    if (folds.length === 0)
        return text;
    if (onFold)
        onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0; i < folds.length; ++i) {
        const fold = folds[i];
        const end = folds[i + 1] || text.length;
        if (fold === 0)
            res = `\n${indent}${text.slice(0, end)}`;
        else {
            if (mode === FOLD_QUOTED && escapedFolds[fold])
                res += `${text[fold]}\\`;
            res += `\n${indent}${text.slice(fold + 1, end)}`;
        }
    }
    return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i) {
    let ch = text[i + 1];
    while (ch === ' ' || ch === '\t') {
        do {
            ch = text[(i += 1)];
        } while (ch && ch !== '\n');
        ch = text[i + 1];
    }
    return i;
}

const getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
});
// Also checks for lines starting with %, as parsing the output as YAML 1.1 will
// presume that's starting a new document.
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
        return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
        return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === '\n') {
            if (i - start > limit)
                return true;
            start = i + 1;
            if (strLen - start <= limit)
                return false;
        }
    }
    return true;
}
function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
        return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    let str = '';
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
            // space before newline needs to be escaped to not be folded
            str += json.slice(start, i) + '\\ ';
            i += 1;
            start = i;
            ch = '\\';
        }
        if (ch === '\\')
            switch (json[i + 1]) {
                case 'u':
                    {
                        str += json.slice(start, i);
                        const code = json.substr(i + 2, 4);
                        switch (code) {
                            case '0000':
                                str += '\\0';
                                break;
                            case '0007':
                                str += '\\a';
                                break;
                            case '000b':
                                str += '\\v';
                                break;
                            case '001b':
                                str += '\\e';
                                break;
                            case '0085':
                                str += '\\N';
                                break;
                            case '00a0':
                                str += '\\_';
                                break;
                            case '2028':
                                str += '\\L';
                                break;
                            case '2029':
                                str += '\\P';
                                break;
                            default:
                                if (code.substr(0, 2) === '00')
                                    str += '\\x' + code.substr(2);
                                else
                                    str += json.substr(i, 6);
                        }
                        i += 5;
                        start = i + 1;
                    }
                    break;
                case 'n':
                    if (implicitKey ||
                        json[i + 2] === '"' ||
                        json.length < minMultiLineLength) {
                        i += 1;
                    }
                    else {
                        // folding will eat first newline
                        str += json.slice(start, i) + '\n\n';
                        while (json[i + 2] === '\\' &&
                            json[i + 3] === 'n' &&
                            json[i + 4] !== '"') {
                            str += '\n';
                            i += 2;
                        }
                        str += indent;
                        // space after newline needs to be escaped to not be folded
                        if (json[i + 2] === ' ')
                            str += '\\';
                        i += 1;
                        start = i + 1;
                    }
                    break;
                default:
                    i += 1;
            }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey
        ? str
        : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false ||
        (ctx.implicitKey && value.includes('\n')) ||
        /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
    )
        return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
    return ctx.implicitKey
        ? res
        : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
        qs = doubleQuotedString;
    else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
            qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
            qs = doubleQuotedString;
        else
            qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
}
// The negative lookbehind avoids a polynomial search,
// but isn't supported yet on Safari: https://caniuse.com/js-regexp-lookbehind
let blockEndNewlines;
try {
    blockEndNewlines = new RegExp('(^|(?<!\n))\n+(?!\n|$)', 'g');
}
catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    // 1. Block can't end in whitespace unless the last line is non-empty.
    // 2. Strings consisting of only whitespace are best rendered explicitly.
    if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
        return quotedString(value, ctx);
    }
    const indent = ctx.indent ||
        (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
    const literal = blockQuote === 'literal'
        ? true
        : blockQuote === 'folded' || type === Scalar.BLOCK_FOLDED
            ? false
            : type === Scalar.BLOCK_LITERAL
                ? true
                : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
        return literal ? '|\n' : '>\n';
    // determine chomping from whitespace at value end
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== '\n' && ch !== '\t' && ch !== ' ')
            break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf('\n');
    if (endNlPos === -1) {
        chomp = '-'; // strip
    }
    else if (value === end || endNlPos !== end.length - 1) {
        chomp = '+'; // keep
        if (onChompKeep)
            onChompKeep();
    }
    else {
        chomp = ''; // clip
    }
    if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === '\n')
            end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    // determine indent indicator from whitespace at value start
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === ' ')
            startWithSpace = true;
        else if (ch === '\n')
            startNlPos = startEnd;
        else
            break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? '2' : '1'; // root is at -1
    let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
    if (comment) {
        header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
        if (onComment)
            onComment();
    }
    if (literal) {
        value = value.replace(/\n+/g, `$&${indent}`);
        return `${header}\n${indent}${start}${value}${end}`;
    }
    value = value
        .replace(/\n+/g, '\n$&')
        .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
        //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
        .replace(/\n+/g, `$&${indent}`);
    const body = foldFlowLines(`${start}${value}${end}`, indent, FOLD_BLOCK, getFoldOptions(ctx, true));
    return `${header}\n${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if ((implicitKey && value.includes('\n')) ||
        (inFlow && /[[\]{},]/.test(value))) {
        return quotedString(value, ctx);
    }
    if (!value ||
        /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        // not allowed:
        // - empty string, '-' or '?'
        // - start with an indicator character (except [?:-]) or /[?-] /
        // - '\n ', ': ' or ' \n' anywhere
        // - '#' not preceded by a non-space char
        // - end with ' ' or ':'
        return implicitKey || inFlow || !value.includes('\n')
            ? quotedString(value, ctx)
            : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey &&
        !inFlow &&
        type !== Scalar.PLAIN &&
        value.includes('\n')) {
        // Where allowed & type not set explicitly, prefer block style for multiline strings
        return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
        if (indent === '') {
            ctx.forceBlockIndent = true;
            return blockString(item, ctx, onComment, onChompKeep);
        }
        else if (implicitKey && indent === indentStep) {
            return quotedString(value, ctx);
        }
    }
    const str = value.replace(/\n+/g, `$&\n${indent}`);
    // Verify that output will be parsed as a string, as e.g. plain numbers and
    // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
    // and others in v1.1.
    if (actualString) {
        const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
            return quotedString(value, ctx);
    }
    return implicitKey
        ? str
        : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === 'string'
        ? item
        : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.QUOTE_DOUBLE) {
        // force double quotes on control characters & unpaired surrogates
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
            type = Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
        switch (_type) {
            case Scalar.BLOCK_FOLDED:
            case Scalar.BLOCK_LITERAL:
                return implicitKey || inFlow
                    ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                    : blockString(ss, ctx, onComment, onChompKeep);
            case Scalar.QUOTE_DOUBLE:
                return doubleQuotedString(ss.value, ctx);
            case Scalar.QUOTE_SINGLE:
                return singleQuotedString(ss.value, ctx);
            case Scalar.PLAIN:
                return plainString(ss, ctx, onComment, onChompKeep);
            default:
                return null;
        }
    };
    let res = _stringify(type);
    if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = (implicitKey && defaultKeyType) || defaultStringType;
        res = _stringify(t);
        if (res === null)
            throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
}

function createStringifyContext(doc, options) {
    const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment,
        defaultKeyType: null,
        defaultStringType: 'PLAIN',
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: 'false',
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: 'null',
        simpleKeys: false,
        singleQuote: null,
        trueStr: 'true',
        verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
        case 'block':
            inFlow = false;
            break;
        case 'flow':
            inFlow = true;
            break;
        default:
            inFlow = null;
    }
    return {
        anchors: new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? ' ' : '',
        indent: '',
        indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
        inFlow,
        options: opt
    };
}
function getTagObject(tags, item) {
    if (item.tag) {
        const match = tags.filter(t => t.tag === item.tag);
        if (match.length > 0)
            return match.find(t => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (isScalar(item)) {
        obj = item.value;
        const match = tags.filter(t => t.identify?.(obj));
        tagObj =
            match.find(t => t.format === item.format) ?? match.find(t => !t.format);
    }
    else {
        obj = item;
        tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
        const name = obj?.constructor?.name ?? typeof obj;
        throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
}
// needs to be called before value stringifier to allow for circular anchor refs
function stringifyProps(node, tagObj, { anchors, doc }) {
    if (!doc.directives)
        return '';
    const props = [];
    const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
    if (anchor && anchorIsValid(anchor)) {
        anchors.add(anchor);
        props.push(`&${anchor}`);
    }
    const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
    if (tag)
        props.push(doc.directives.tagString(tag));
    return props.join(' ');
}
function stringify(item, ctx, onComment, onChompKeep) {
    if (isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
    if (isAlias(item)) {
        if (ctx.doc.directives)
            return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
            throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        }
        else {
            if (ctx.resolvedAliases)
                ctx.resolvedAliases.add(item);
            else
                ctx.resolvedAliases = new Set([item]);
            item = item.resolve(ctx.doc);
        }
    }
    let tagObj = undefined;
    const node = isNode(item)
        ? item
        : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
    if (!tagObj)
        tagObj = getTagObject(ctx.doc.schema.tags, node);
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === 'function'
        ? tagObj.stringify(node, ctx, onComment, onChompKeep)
        : isScalar(node)
            ? stringifyString(node, ctx, onComment, onChompKeep)
            : node.toString(ctx, onComment, onChompKeep);
    if (!props)
        return str;
    return isScalar(node) || str[0] === '{' || str[0] === '['
        ? `${props} ${str}`
        : `${props}\n${ctx.indent}${str}`;
}

function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = (isNode(key) && key.comment) || null;
    if (simpleKeys) {
        if (keyComment) {
            throw new Error('With simple keys, key nodes cannot have comments');
        }
        if (isCollection(key)) {
            const msg = 'With simple keys, collection cannot be used as a key value';
            throw new Error(msg);
        }
    }
    let explicitKey = !simpleKeys &&
        (!key ||
            (keyComment && value == null && !ctx.inFlow) ||
            isCollection(key) ||
            (isScalar(key)
                ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL
                : typeof key === 'object'));
    ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
            throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
        explicitKey = true;
    }
    if (ctx.inFlow) {
        if (allNullValues || value == null) {
            if (keyCommentDone && onComment)
                onComment();
            return str === '' ? '?' : explicitKey ? `? ${str}` : str;
        }
    }
    else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
            str += lineComment(str, ctx.indent, commentString(keyComment));
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    if (keyCommentDone)
        keyComment = null;
    if (explicitKey) {
        if (keyComment)
            str += lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}\n${indent}:`;
    }
    else {
        str = `${str}:`;
        if (keyComment)
            str += lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
    }
    else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === 'object')
            value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && isScalar(value))
        ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq &&
        indentStep.length >= 2 &&
        !ctx.inFlow &&
        !explicitKey &&
        isSeq(value) &&
        !value.flow &&
        !value.tag &&
        !value.anchor) {
        // If indentSeq === false, consider '- ' as part of indentation where possible
        ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
    let ws = ' ';
    if (keyComment || vsb || vcb) {
        ws = vsb ? '\n' : '';
        if (vcb) {
            const cs = commentString(vcb);
            ws += `\n${indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === '' && !ctx.inFlow) {
            if (ws === '\n')
                ws = '\n\n';
        }
        else {
            ws += `\n${ctx.indent}`;
        }
    }
    else if (!explicitKey && isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf('\n');
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
            let hasPropsLine = false;
            if (hasNewline && (vs0 === '&' || vs0 === '!')) {
                let sp0 = valueStr.indexOf(' ');
                if (vs0 === '&' &&
                    sp0 !== -1 &&
                    sp0 < nl0 &&
                    valueStr[sp0 + 1] === '!') {
                    sp0 = valueStr.indexOf(' ', sp0 + 1);
                }
                if (sp0 === -1 || nl0 < sp0)
                    hasPropsLine = true;
            }
            if (!hasPropsLine)
                ws = `\n${ctx.indent}`;
        }
    }
    else if (valueStr === '' || valueStr[0] === '\n') {
        ws = '';
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
        if (valueCommentDone && onComment)
            onComment();
    }
    else if (valueComment && !valueCommentDone) {
        str += lineComment(str, ctx.indent, commentString(valueComment));
    }
    else if (chompKeep && onChompKeep) {
        onChompKeep();
    }
    return str;
}

function warn(logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        // https://github.com/typescript-eslint/typescript-eslint/issues/7478
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (typeof process !== 'undefined' && process.emitWarning)
            process.emitWarning(warning);
        else
            console.warn(warning);
    }
}

const MERGE_KEY = '<<';
function addPairToJSMap(ctx, map, { key, value }) {
    if (ctx?.doc.schema.merge && isMergeKey(key)) {
        value = isAlias(value) ? value.resolve(ctx.doc) : value;
        if (isSeq(value))
            for (const it of value.items)
                mergeToJSMap(ctx, map, it);
        else if (Array.isArray(value))
            for (const it of value)
                mergeToJSMap(ctx, map, it);
        else
            mergeToJSMap(ctx, map, value);
    }
    else {
        const jsKey = toJS(key, '', ctx);
        if (map instanceof Map) {
            map.set(jsKey, toJS(value, jsKey, ctx));
        }
        else if (map instanceof Set) {
            map.add(jsKey);
        }
        else {
            const stringKey = stringifyKey(key, jsKey, ctx);
            const jsValue = toJS(value, stringKey, ctx);
            if (stringKey in map)
                Object.defineProperty(map, stringKey, {
                    value: jsValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            else
                map[stringKey] = jsValue;
        }
    }
    return map;
}
const isMergeKey = (key) => key === MERGE_KEY ||
    (isScalar(key) &&
        key.value === MERGE_KEY &&
        (!key.type || key.type === Scalar.PLAIN));
// If the value associated with a merge key is a single mapping node, each of
// its key/value pairs is inserted into the current mapping, unless the key
// already exists in it. If the value associated with the merge key is a
// sequence, then this sequence is expected to contain mapping nodes and each
// of these nodes is merged in turn according to its order in the sequence.
// Keys in mapping nodes earlier in the sequence override keys specified in
// later mapping nodes. -- http://yaml.org/type/merge.html
function mergeToJSMap(ctx, map, value) {
    const source = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
    if (!isMap(source))
        throw new Error('Merge sources must be maps or map aliases');
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
        if (map instanceof Map) {
            if (!map.has(key))
                map.set(key, value);
        }
        else if (map instanceof Set) {
            map.add(key);
        }
        else if (!Object.prototype.hasOwnProperty.call(map, key)) {
            Object.defineProperty(map, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }
    return map;
}
function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
        return '';
    if (typeof jsKey !== 'object')
        return String(jsKey);
    if (isNode(key) && ctx?.doc) {
        const strCtx = createStringifyContext(ctx.doc, {});
        strCtx.anchors = new Set();
        for (const node of ctx.anchors.keys())
            strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
            let jsonStr = JSON.stringify(strKey);
            if (jsonStr.length > 40)
                jsonStr = jsonStr.substring(0, 36) + '..."';
            warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
            ctx.mapKeyWarned = true;
        }
        return strKey;
    }
    return JSON.stringify(jsKey);
}

function createPair(key, value, ctx) {
    const k = createNode(key, undefined, ctx);
    const v = createNode(value, undefined, ctx);
    return new Pair(k, v);
}
class Pair {
    constructor(key, value = null) {
        Object.defineProperty(this, NODE_TYPE, { value: PAIR });
        this.key = key;
        this.value = value;
    }
    clone(schema) {
        let { key, value } = this;
        if (isNode(key))
            key = key.clone(schema);
        if (isNode(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? stringifyPair(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}

function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false; // flag for the preceding node's status
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (isNode(item)) {
            if (!chompKeep && item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
            if (item.comment)
                comment = item.comment;
        }
        else if (isPair(item)) {
            const ik = isNode(item.key) ? item.key : null;
            if (ik) {
                if (!chompKeep && ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
            }
        }
        chompKeep = false;
        let str = stringify(item, itemCtx, () => (comment = null), () => (chompKeep = true));
        if (comment)
            str += lineComment(str, itemIndent, commentString(comment));
        if (chompKeep && comment)
            chompKeep = false;
        lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
    }
    else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
            const line = lines[i];
            str += line ? `\n${indent}${line}` : '\n';
        }
    }
    if (comment) {
        str += '\n' + indentComment(commentString(comment), indent);
        if (onComment)
            onComment();
    }
    else if (chompKeep && onChompKeep)
        onChompKeep();
    return str;
}
function stringifyFlowCollection({ comment, items }, ctx, { flowChars, itemIndent, onComment }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (isNode(item)) {
            if (item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, false);
            if (item.comment)
                comment = item.comment;
        }
        else if (isPair(item)) {
            const ik = isNode(item.key) ? item.key : null;
            if (ik) {
                if (ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, false);
                if (ik.comment)
                    reqNewline = true;
            }
            const iv = isNode(item.value) ? item.value : null;
            if (iv) {
                if (iv.comment)
                    comment = iv.comment;
                if (iv.commentBefore)
                    reqNewline = true;
            }
            else if (item.value == null && ik?.comment) {
                comment = ik.comment;
            }
        }
        if (comment)
            reqNewline = true;
        let str = stringify(item, itemCtx, () => (comment = null));
        if (i < items.length - 1)
            str += ',';
        if (comment)
            str += lineComment(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
            reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
    }
    let str;
    const { start, end } = flowChars;
    if (lines.length === 0) {
        str = start + end;
    }
    else {
        if (!reqNewline) {
            const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
            reqNewline = len > Collection.maxFlowStringSingleLineLength;
        }
        if (reqNewline) {
            str = start;
            for (const line of lines)
                str += line ? `\n${indentStep}${indent}${line}` : '\n';
            str += `\n${indent}${end}`;
        }
        else {
            str = `${start}${fcPadding}${lines.join(' ')}${fcPadding}${end}`;
        }
    }
    if (comment) {
        str += lineComment(str, indent, commentString(comment));
        if (onComment)
            onComment();
    }
    return str;
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
        comment = comment.replace(/^\n+/, '');
    if (comment) {
        const ic = indentComment(commentString(comment), indent);
        lines.push(ic.trimStart()); // Avoid double indent on first line
    }
}

function findPair(items, key) {
    const k = isScalar(key) ? key.value : key;
    for (const it of items) {
        if (isPair(it)) {
            if (it.key === key || it.key === k)
                return it;
            if (isScalar(it.key) && it.key.value === k)
                return it;
        }
    }
    return undefined;
}
class YAMLMap extends Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:map';
    }
    constructor(schema) {
        super(MAP, schema);
        this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
            if (typeof replacer === 'function')
                value = replacer.call(obj, key, value);
            else if (Array.isArray(replacer) && !replacer.includes(key))
                return;
            if (value !== undefined || keepUndefined)
                map.items.push(createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
            for (const [key, value] of obj)
                add(key, value);
        }
        else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj))
                add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === 'function') {
            map.items.sort(schema.sortMapEntries);
        }
        return map;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
        let _pair;
        if (isPair(pair))
            _pair = pair;
        else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
            // In TypeScript, this never happens.
            _pair = new Pair(pair, pair?.value);
        }
        else
            _pair = new Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
            if (!overwrite)
                throw new Error(`Key ${_pair.key} already set`);
            // For scalars, keep the old node & its comments and anchors
            if (isScalar(prev.value) && isScalarValue(_pair.value))
                prev.value.value = _pair.value;
            else
                prev.value = _pair.value;
        }
        else if (sortEntries) {
            const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
            if (i === -1)
                this.items.push(_pair);
            else
                this.items.splice(i, 0, _pair);
        }
        else {
            this.items.push(_pair);
        }
    }
    delete(key) {
        const it = findPair(this.items, key);
        if (!it)
            return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
        return !!findPair(this.items, key);
    }
    set(key, value) {
        this.add(new Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const item of this.items)
            addPairToJSMap(ctx, map, item);
        return map;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        for (const item of this.items) {
            if (!isPair(item))
                throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
            ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection(this, ctx, {
            blockItemPrefix: '',
            flowChars: { start: '{', end: '}' },
            itemIndent: ctx.indent || '',
            onChompKeep,
            onComment
        });
    }
}

const map = {
    collection: 'map',
    default: true,
    nodeClass: YAMLMap,
    tag: 'tag:yaml.org,2002:map',
    resolve(map, onError) {
        if (!isMap(map))
            onError('Expected a mapping for this tag');
        return map;
    },
    createNode: (schema, obj, ctx) => YAMLMap.from(schema, obj, ctx)
};

class YAMLSeq extends Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:seq';
    }
    constructor(schema) {
        super(SEQ, schema);
        this.items = [];
    }
    add(value) {
        this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return undefined;
        const it = this.items[idx];
        return !keepScalar && isScalar(it) ? it.value : it;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
        const idx = asItemIndex(key);
        return typeof idx === 'number' && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (isScalar(prev) && isScalarValue(value))
            prev.value = value;
        else
            this.items[idx] = value;
    }
    toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
            ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
            seq.push(toJS(item, String(i++), ctx));
        return seq;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        return stringifyCollection(this, ctx, {
            blockItemPrefix: '- ',
            flowChars: { start: '[', end: ']' },
            itemIndent: (ctx.indent || '') + '  ',
            onChompKeep,
            onComment
        });
    }
    static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
            let i = 0;
            for (let it of obj) {
                if (typeof replacer === 'function') {
                    const key = obj instanceof Set ? it : String(i++);
                    it = replacer.call(obj, key, it);
                }
                seq.items.push(createNode(it, undefined, ctx));
            }
        }
        return seq;
    }
}
function asItemIndex(key) {
    let idx = isScalar(key) ? key.value : key;
    if (idx && typeof idx === 'string')
        idx = Number(idx);
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
        ? idx
        : null;
}

const seq = {
    collection: 'seq',
    default: true,
    nodeClass: YAMLSeq,
    tag: 'tag:yaml.org,2002:seq',
    resolve(seq, onError) {
        if (!isSeq(seq))
            onError('Expected a sequence for this tag');
        return seq;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.from(schema, obj, ctx)
};

const string = {
    identify: value => typeof value === 'string',
    default: true,
    tag: 'tag:yaml.org,2002:str',
    resolve: str => str,
    stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString(item, ctx, onComment, onChompKeep);
    }
};

const nullTag = {
    identify: value => value == null,
    createNode: () => new Scalar(null),
    default: true,
    tag: 'tag:yaml.org,2002:null',
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar(null),
    stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
        ? source
        : ctx.options.nullStr
};

const boolTag = {
    identify: value => typeof value === 'boolean',
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: str => new Scalar(str[0] === 't' || str[0] === 'T'),
    stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
            const sv = source[0] === 't' || source[0] === 'T';
            if (value === sv)
                return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
};

function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === 'bigint')
        return String(value);
    const num = typeof value === 'number' ? value : Number(value);
    if (!isFinite(num))
        return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
    let n = JSON.stringify(value);
    if (!format &&
        minFractionDigits &&
        (!tag || tag === 'tag:yaml.org,2002:float') &&
        /^\d/.test(n)) {
        let i = n.indexOf('.');
        if (i < 0) {
            i = n.length;
            n += '.';
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
            n += '0';
    }
    return n;
}

const floatNaN$1 = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
    resolve: str => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber
};
const floatExp$1 = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: str => parseFloat(str),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber(node);
    }
};
const float$1 = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
        const node = new Scalar(parseFloat(str));
        const dot = str.indexOf('.');
        if (dot !== -1 && str[str.length - 1] === '0')
            node.minFractionDigits = str.length - dot - 1;
        return node;
    },
    stringify: stringifyNumber
};

const intIdentify$2 = (value) => typeof value === 'bigint' || Number.isInteger(value);
const intResolve$1 = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
function intStringify$1(node, radix, prefix) {
    const { value } = node;
    if (intIdentify$2(value) && value >= 0)
        return prefix + value.toString(radix);
    return stringifyNumber(node);
}
const intOct$1 = {
    identify: value => intIdentify$2(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
    stringify: node => intStringify$1(node, 8, '0o')
};
const int$1 = {
    identify: intIdentify$2,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
    stringify: stringifyNumber
};
const intHex$1 = {
    identify: value => intIdentify$2(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
    stringify: node => intStringify$1(node, 16, '0x')
};

const schema$2 = [
    map,
    seq,
    string,
    nullTag,
    boolTag,
    intOct$1,
    int$1,
    intHex$1,
    floatNaN$1,
    floatExp$1,
    float$1
];

function intIdentify$1(value) {
    return typeof value === 'bigint' || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
    {
        identify: value => typeof value === 'string',
        default: true,
        tag: 'tag:yaml.org,2002:str',
        resolve: str => str,
        stringify: stringifyJSON
    },
    {
        identify: value => value == null,
        createNode: () => new Scalar(null),
        default: true,
        tag: 'tag:yaml.org,2002:null',
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
    },
    {
        identify: value => typeof value === 'boolean',
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^true|false$/,
        resolve: str => str === 'true',
        stringify: stringifyJSON
    },
    {
        identify: intIdentify$1,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify$1(value) ? value.toString() : JSON.stringify(value)
    },
    {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: str => parseFloat(str),
        stringify: stringifyJSON
    }
];
const jsonError = {
    default: true,
    tag: '',
    test: /^/,
    resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
    }
};
const schema$1 = [map, seq].concat(jsonScalars, jsonError);

const binary = {
    identify: value => value instanceof Uint8Array,
    default: false,
    tag: 'tag:yaml.org,2002:binary',
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(src, onError) {
        if (typeof Buffer === 'function') {
            return Buffer.from(src, 'base64');
        }
        else if (typeof atob === 'function') {
            // On IE 11, atob() can't handle newlines
            const str = atob(src.replace(/[\n\r]/g, ''));
            const buffer = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i)
                buffer[i] = str.charCodeAt(i);
            return buffer;
        }
        else {
            onError('This environment does not support reading binary tags; either Buffer or atob is required');
            return src;
        }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        const buf = value; // checked earlier by binary.identify()
        let str;
        if (typeof Buffer === 'function') {
            str =
                buf instanceof Buffer
                    ? buf.toString('base64')
                    : Buffer.from(buf.buffer).toString('base64');
        }
        else if (typeof btoa === 'function') {
            let s = '';
            for (let i = 0; i < buf.length; ++i)
                s += String.fromCharCode(buf[i]);
            str = btoa(s);
        }
        else {
            throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
        }
        if (!type)
            type = Scalar.BLOCK_LITERAL;
        if (type !== Scalar.QUOTE_DOUBLE) {
            const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
            const n = Math.ceil(str.length / lineWidth);
            const lines = new Array(n);
            for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
                lines[i] = str.substr(o, lineWidth);
            }
            str = lines.join(type === Scalar.BLOCK_LITERAL ? '\n' : ' ');
        }
        return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
};

function resolvePairs(seq, onError) {
    if (isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
            let item = seq.items[i];
            if (isPair(item))
                continue;
            else if (isMap(item)) {
                if (item.items.length > 1)
                    onError('Each pair must have its own sequence indicator');
                const pair = item.items[0] || new Pair(new Scalar(null));
                if (item.commentBefore)
                    pair.key.commentBefore = pair.key.commentBefore
                        ? `${item.commentBefore}\n${pair.key.commentBefore}`
                        : item.commentBefore;
                if (item.comment) {
                    const cn = pair.value ?? pair.key;
                    cn.comment = cn.comment
                        ? `${item.comment}\n${cn.comment}`
                        : item.comment;
                }
                item = pair;
            }
            seq.items[i] = isPair(item) ? item : new Pair(item);
        }
    }
    else
        onError('Expected a sequence for this tag');
    return seq;
}
function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs = new YAMLSeq(schema);
    pairs.tag = 'tag:yaml.org,2002:pairs';
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
            if (typeof replacer === 'function')
                it = replacer.call(iterable, String(i++), it);
            let key, value;
            if (Array.isArray(it)) {
                if (it.length === 2) {
                    key = it[0];
                    value = it[1];
                }
                else
                    throw new TypeError(`Expected [key, value] tuple: ${it}`);
            }
            else if (it && it instanceof Object) {
                const keys = Object.keys(it);
                if (keys.length === 1) {
                    key = keys[0];
                    value = it[key];
                }
                else {
                    throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
                }
            }
            else {
                key = it;
            }
            pairs.items.push(createPair(key, value, ctx));
        }
    return pairs;
}
const pairs = {
    collection: 'seq',
    default: false,
    tag: 'tag:yaml.org,2002:pairs',
    resolve: resolvePairs,
    createNode: createPairs
};

class YAMLOMap extends YAMLSeq {
    constructor() {
        super();
        this.add = YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.prototype.set.bind(this);
        this.tag = YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
        if (!ctx)
            return super.toJSON(_);
        const map = new Map();
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const pair of this.items) {
            let key, value;
            if (isPair(pair)) {
                key = toJS(pair.key, '', ctx);
                value = toJS(pair.value, key, ctx);
            }
            else {
                key = toJS(pair, '', ctx);
            }
            if (map.has(key))
                throw new Error('Ordered maps must not include duplicate keys');
            map.set(key, value);
        }
        return map;
    }
    static from(schema, iterable, ctx) {
        const pairs = createPairs(schema, iterable, ctx);
        const omap = new this();
        omap.items = pairs.items;
        return omap;
    }
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';
const omap = {
    collection: 'seq',
    identify: value => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: 'tag:yaml.org,2002:omap',
    resolve(seq, onError) {
        const pairs = resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs.items) {
            if (isScalar(key)) {
                if (seenKeys.includes(key.value)) {
                    onError(`Ordered maps must not include duplicate keys: ${key.value}`);
                }
                else {
                    seenKeys.push(key.value);
                }
            }
        }
        return Object.assign(new YAMLOMap(), pairs);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
};

function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
        return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
    identify: value => value === true,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar(true),
    stringify: boolStringify
};
const falseTag = {
    identify: value => value === false,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
    resolve: () => new Scalar(false),
    stringify: boolStringify
};

const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, '')),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
        const node = new Scalar(parseFloat(str.replace(/_/g, '')));
        const dot = str.indexOf('.');
        if (dot !== -1) {
            const f = str.substring(dot + 1).replace(/_/g, '');
            if (f[f.length - 1] === '0')
                node.minFractionDigits = f.length;
        }
        return node;
    },
    stringify: stringifyNumber
};

const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === '-' || sign === '+')
        offset += 1;
    str = str.substring(offset).replace(/_/g, '');
    if (intAsBigInt) {
        switch (radix) {
            case 2:
                str = `0b${str}`;
                break;
            case 8:
                str = `0o${str}`;
                break;
            case 16:
                str = `0x${str}`;
                break;
        }
        const n = BigInt(str);
        return sign === '-' ? BigInt(-1) * n : n;
    }
    const n = parseInt(str, radix);
    return sign === '-' ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber(node);
}
const intBin = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'BIN',
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: node => intStringify(node, 2, '0b')
};
const intOct = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: node => intStringify(node, 8, '0')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber
};
const intHex = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};

class YAMLSet extends YAMLMap {
    constructor(schema) {
        super(schema);
        this.tag = YAMLSet.tag;
    }
    add(key) {
        let pair;
        if (isPair(key))
            pair = key;
        else if (key &&
            typeof key === 'object' &&
            'key' in key &&
            'value' in key &&
            key.value === null)
            pair = new Pair(key.key, null);
        else
            pair = new Pair(key, null);
        const prev = findPair(this.items, pair.key);
        if (!prev)
            this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
        const pair = findPair(this.items, key);
        return !keepPair && isPair(pair)
            ? isScalar(pair.key)
                ? pair.key.value
                : pair.key
            : pair;
    }
    set(key, value) {
        if (typeof value !== 'boolean')
            throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = findPair(this.items, key);
        if (prev && !value) {
            this.items.splice(this.items.indexOf(prev), 1);
        }
        else if (!prev && value) {
            this.items.push(new Pair(key));
        }
    }
    toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        if (this.hasAllNullValues(true))
            return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
            throw new Error('Set items must all have null values');
    }
    static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
            for (let value of iterable) {
                if (typeof replacer === 'function')
                    value = replacer.call(iterable, value, value);
                set.items.push(createPair(value, null, ctx));
            }
        return set;
    }
}
YAMLSet.tag = 'tag:yaml.org,2002:set';
const set = {
    collection: 'map',
    identify: value => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: 'tag:yaml.org,2002:set',
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
        if (isMap(map)) {
            if (map.hasAllNullValues(true))
                return Object.assign(new YAMLSet(), map);
            else
                onError('Set items must all have null values');
        }
        else
            onError('Expected a mapping for this tag');
        return map;
    }
};

/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts
        .replace(/_/g, '')
        .split(':')
        .reduce((res, p) => res * num(60) + num(p), num(0));
    return (sign === '-' ? num(-1) * res : res);
}
/**
 * hhhh:mm:ss.sss
 *
 * Internal types handle bigint as number, because TS can't figure it out.
 */
function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === 'bigint')
        num = n => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
        return stringifyNumber(node);
    let sign = '';
    if (value < 0) {
        sign = '-';
        value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60]; // seconds, including ms
    if (value < 60) {
        parts.unshift(0); // at least one : is required
    }
    else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60); // minutes
        if (value >= 60) {
            value = (value - parts[0]) / _60;
            parts.unshift(value); // hours
        }
    }
    return (sign +
        parts
            .map(n => String(n).padStart(2, '0'))
            .join(':')
            .replace(/000000\d*$/, '') // % 60 may introduce error
    );
}
const intTime = {
    identify: value => typeof value === 'bigint' || Number.isInteger(value),
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
};
const floatTime = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: str => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
};
const timestamp = {
    identify: value => value instanceof Date,
    default: true,
    tag: 'tag:yaml.org,2002:timestamp',
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
        '(?:' + // time is optional
        '(?:t|T|[ \\t]+)' + // t | T | whitespace
        '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
        '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
        ')?$'),
    resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
            throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== 'Z') {
            let d = parseSexagesimal(tz, false);
            if (Math.abs(d) < 30)
                d *= 60;
            date -= 60000 * d;
        }
        return new Date(date);
    },
    stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
};

const schema = [
    map,
    seq,
    string,
    nullTag,
    trueTag,
    falseTag,
    intBin,
    intOct,
    int,
    intHex,
    floatNaN,
    floatExp,
    float,
    binary,
    omap,
    pairs,
    set,
    intTime,
    floatTime,
    timestamp
];

const schemas = new Map([
    ['core', schema$2],
    ['failsafe', [map, seq, string]],
    ['json', schema$1],
    ['yaml11', schema],
    ['yaml-1.1', schema]
]);
const tagsByName = {
    binary,
    bool: boolTag,
    float: float$1,
    floatExp: floatExp$1,
    floatNaN: floatNaN$1,
    floatTime,
    int: int$1,
    intHex: intHex$1,
    intOct: intOct$1,
    intTime,
    map,
    null: nullTag,
    omap,
    pairs,
    seq,
    set,
    timestamp
};
const coreKnownTags = {
    'tag:yaml.org,2002:binary': binary,
    'tag:yaml.org,2002:omap': omap,
    'tag:yaml.org,2002:pairs': pairs,
    'tag:yaml.org,2002:set': set,
    'tag:yaml.org,2002:timestamp': timestamp
};
function getTags(customTags, schemaName) {
    let tags = schemas.get(schemaName);
    if (!tags) {
        if (Array.isArray(customTags))
            tags = [];
        else {
            const keys = Array.from(schemas.keys())
                .filter(key => key !== 'yaml11')
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
    }
    if (Array.isArray(customTags)) {
        for (const tag of customTags)
            tags = tags.concat(tag);
    }
    else if (typeof customTags === 'function') {
        tags = customTags(tags.slice());
    }
    return tags.map(tag => {
        if (typeof tag !== 'string')
            return tag;
        const tagObj = tagsByName[tag];
        if (tagObj)
            return tagObj;
        const keys = Object.keys(tagsByName)
            .map(key => JSON.stringify(key))
            .join(', ');
        throw new Error(`Unknown custom tag "${tag}"; use one of ${keys}`);
    });
}

const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat)
            ? getTags(compat, 'compat')
            : compat
                ? getTags(null, compat)
                : null;
        this.merge = !!merge;
        this.name = (typeof schema === 'string' && schema) || 'core';
        this.knownTags = resolveKnownTags ? coreKnownTags : {};
        this.tags = getTags(customTags, this.name);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, MAP, { value: map });
        Object.defineProperty(this, SCALAR$1, { value: string });
        Object.defineProperty(this, SEQ, { value: seq });
        // Used by createMap()
        this.sortMapEntries =
            typeof sortMapEntries === 'function'
                ? sortMapEntries
                : sortMapEntries === true
                    ? sortMapEntriesByKey
                    : null;
    }
    clone() {
        const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
    }
}

function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
            lines.push(dir);
            hasDirectives = true;
        }
        else if (doc.directives.docStart)
            hasDirectives = true;
    }
    if (hasDirectives)
        lines.push('---');
    const ctx = createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
        if (lines.length !== 1)
            lines.unshift('');
        const cs = commentString(doc.commentBefore);
        lines.unshift(indentComment(cs, ''));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
        if (isNode(doc.contents)) {
            if (doc.contents.spaceBefore && hasDirectives)
                lines.push('');
            if (doc.contents.commentBefore) {
                const cs = commentString(doc.contents.commentBefore);
                lines.push(indentComment(cs, ''));
            }
            // top-level block scalars need to be indented if followed by a comment
            ctx.forceBlockIndent = !!doc.comment;
            contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
        let body = stringify(doc.contents, ctx, () => (contentComment = null), onChompKeep);
        if (contentComment)
            body += lineComment(body, '', commentString(contentComment));
        if ((body[0] === '|' || body[0] === '>') &&
            lines[lines.length - 1] === '---') {
            // Top-level block scalars with a preceding doc marker ought to use the
            // same line for their header.
            lines[lines.length - 1] = `--- ${body}`;
        }
        else
            lines.push(body);
    }
    else {
        lines.push(stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
        if (doc.comment) {
            const cs = commentString(doc.comment);
            if (cs.includes('\n')) {
                lines.push('...');
                lines.push(indentComment(cs, ''));
            }
            else {
                lines.push(`... ${cs}`);
            }
        }
        else {
            lines.push('...');
        }
    }
    else {
        let dc = doc.comment;
        if (dc && chompKeep)
            dc = dc.replace(/^\n+/, '');
        if (dc) {
            if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
                lines.push('');
            lines.push(indentComment(commentString(dc), ''));
        }
    }
    return lines.join('\n') + '\n';
}

class Document {
    constructor(value, replacer, options) {
        /** A comment before this Document */
        this.commentBefore = null;
        /** A comment immediately after this Document */
        this.comment = null;
        /** Errors encountered during parsing. */
        this.errors = [];
        /** Warnings encountered during parsing. */
        this.warnings = [];
        Object.defineProperty(this, NODE_TYPE, { value: DOC });
        let _replacer = null;
        if (typeof replacer === 'function' || Array.isArray(replacer)) {
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const opt = Object.assign({
            intAsBigInt: false,
            keepSourceTokens: false,
            logLevel: 'warn',
            prettyErrors: true,
            strict: true,
            uniqueKeys: true,
            version: '1.2'
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
            this.directives = options._directives.atDocument();
            if (this.directives.yaml.explicit)
                version = this.directives.yaml.version;
        }
        else
            this.directives = new Directives({ version });
        this.setSchema(version, options);
        // @ts-expect-error We can't really know that this matches Contents.
        this.contents =
            value === undefined ? null : this.createNode(value, _replacer, options);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
        const copy = Object.create(Document.prototype, {
            [NODE_TYPE]: { value: DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
            copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        // @ts-expect-error We can't really know that this matches Contents.
        copy.contents = isNode(this.contents)
            ? this.contents.clone(copy.schema)
            : this.contents;
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** Adds a value to the document. */
    add(value) {
        if (assertCollection(this.contents))
            this.contents.add(value);
    }
    /** Adds a value to the document. */
    addIn(path, value) {
        if (assertCollection(this.contents))
            this.contents.addIn(path, value);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(node, name) {
        if (!node.anchor) {
            const prev = anchorNames(this);
            node.anchor =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                !name || prev.has(name) ? findNewAnchor(name || 'a', prev) : name;
        }
        return new Alias(node.anchor);
    }
    createNode(value, replacer, options) {
        let _replacer = undefined;
        if (typeof replacer === 'function') {
            value = replacer.call({ '': value }, '', value);
            _replacer = replacer;
        }
        else if (Array.isArray(replacer)) {
            const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
            const asStr = replacer.filter(keyToStr).map(String);
            if (asStr.length > 0)
                replacer = replacer.concat(asStr);
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(this, 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        anchorPrefix || 'a');
        const ctx = {
            aliasDuplicateObjects: aliasDuplicateObjects ?? true,
            keepUndefined: keepUndefined ?? false,
            onAnchor,
            onTagObj,
            replacer: _replacer,
            schema: this.schema,
            sourceObjects
        };
        const node = createNode(value, tag, ctx);
        if (flow && isCollection(node))
            node.flow = true;
        setAnchors();
        return node;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair(k, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        if (isEmptyPath(path)) {
            if (this.contents == null)
                return false;
            // @ts-expect-error Presumed impossible if Strict extends false
            this.contents = null;
            return true;
        }
        return assertCollection(this.contents)
            ? this.contents.deleteIn(path)
            : false;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(key, keepScalar) {
        return isCollection(this.contents)
            ? this.contents.get(key, keepScalar)
            : undefined;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        if (isEmptyPath(path))
            return !keepScalar && isScalar(this.contents)
                ? this.contents.value
                : this.contents;
        return isCollection(this.contents)
            ? this.contents.getIn(path, keepScalar)
            : undefined;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(key) {
        return isCollection(this.contents) ? this.contents.has(key) : false;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(path) {
        if (isEmptyPath(path))
            return this.contents !== undefined;
        return isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(key, value) {
        if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = collectionFromPath(this.schema, [key], value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.set(key, value);
        }
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        if (isEmptyPath(path)) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = value;
        }
        else if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = collectionFromPath(this.schema, Array.from(path), value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.setIn(path, value);
        }
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(version, options = {}) {
        if (typeof version === 'number')
            version = String(version);
        let opt;
        switch (version) {
            case '1.1':
                if (this.directives)
                    this.directives.yaml.version = '1.1';
                else
                    this.directives = new Directives({ version: '1.1' });
                opt = { merge: true, resolveKnownTags: false, schema: 'yaml-1.1' };
                break;
            case '1.2':
            case 'next':
                if (this.directives)
                    this.directives.yaml.version = version;
                else
                    this.directives = new Directives({ version });
                opt = { merge: false, resolveKnownTags: true, schema: 'core' };
                break;
            case null:
                if (this.directives)
                    delete this.directives;
                opt = null;
                break;
            default: {
                const sv = JSON.stringify(version);
                throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
            }
        }
        // Not using `instanceof Schema` to allow for duck typing
        if (options.schema instanceof Object)
            this.schema = options.schema;
        else if (opt)
            this.schema = new Schema(Object.assign(opt, options));
        else
            throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
            anchors: new Map(),
            doc: this,
            keep: !json,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = toJS(this.contents, jsonArg ?? '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? applyReviver(reviver, { '': res }, '', res)
            : res;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    /** A YAML representation of the document. */
    toString(options = {}) {
        if (this.errors.length > 0)
            throw new Error('Document with errors cannot be stringified');
        if ('indent' in options &&
            (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
            const s = JSON.stringify(options.indent);
            throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument(this, options);
    }
}
function assertCollection(contents) {
    if (isCollection(contents))
        return true;
    throw new Error('Expected a YAML collection as document contents');
}

class YAMLError extends Error {
    constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
    }
}
class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLParseError', pos, code, message);
    }
}
class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLWarning', pos, code, message);
    }
}
const prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
        return;
    error.linePos = error.pos.map(pos => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src
        .substring(lc.lineStarts[line - 1], lc.lineStarts[line])
        .replace(/[\n\r]+$/, '');
    // Trim to max 80 chars, keeping col position near the middle
    if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = '…' + lineStr.substring(trimStart);
        ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + '…';
    // Include previous line in context if pointing at line start
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        // Regexp won't match if start is trimmed
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
            prev = prev.substring(0, 79) + '…\n';
        lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end && end.line === line && end.col > col) {
            count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = ' '.repeat(ci) + '^'.repeat(count);
        error.message += `:\n\n${lineStr}\n${pointer}\n`;
    }
};

function resolveProps(tokens, { flow, indicator, next, offset, onError, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = '';
    let commentSep = '';
    let hasNewline = false;
    let hasNewlineAfterProp = false;
    let reqSpace = false;
    let anchor = null;
    let tag = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
        if (reqSpace) {
            if (token.type !== 'space' &&
                token.type !== 'newline' &&
                token.type !== 'comma')
                onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
            reqSpace = false;
        }
        switch (token.type) {
            case 'space':
                // At the doc level, tabs at line start may be parsed
                // as leading white space rather than indentation.
                // In a flow collection, only the parser handles indent.
                if (!flow &&
                    atNewline &&
                    indicator !== 'doc-start' &&
                    token.source[0] === '\t')
                    onError(token, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
                hasSpace = true;
                break;
            case 'comment': {
                if (!hasSpace)
                    onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                const cb = token.source.substring(1) || ' ';
                if (!comment)
                    comment = cb;
                else
                    comment += commentSep + cb;
                commentSep = '';
                atNewline = false;
                break;
            }
            case 'newline':
                if (atNewline) {
                    if (comment)
                        comment += token.source;
                    else
                        spaceBefore = true;
                }
                else
                    commentSep += token.source;
                atNewline = true;
                hasNewline = true;
                if (anchor || tag)
                    hasNewlineAfterProp = true;
                hasSpace = true;
                break;
            case 'anchor':
                if (anchor)
                    onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
                if (token.source.endsWith(':'))
                    onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
                anchor = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            case 'tag': {
                if (tag)
                    onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
                tag = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            }
            case indicator:
                // Could here handle preceding comments differently
                if (anchor || tag)
                    onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
                if (found)
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
                found = token;
                atNewline = false;
                hasSpace = false;
                break;
            case 'comma':
                if (flow) {
                    if (comma)
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
                    comma = token;
                    atNewline = false;
                    hasSpace = false;
                    break;
                }
            // else fallthrough
            default:
                onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
                atNewline = false;
                hasSpace = false;
        }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace &&
        next &&
        next.type !== 'space' &&
        next.type !== 'newline' &&
        next.type !== 'comma' &&
        (next.type !== 'scalar' || next.source !== ''))
        onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
    return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        hasNewlineAfterProp,
        anchor,
        tag,
        end,
        start: start ?? end
    };
}

function containsNewline(key) {
    if (!key)
        return null;
    switch (key.type) {
        case 'alias':
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            if (key.source.includes('\n'))
                return true;
            if (key.end)
                for (const st of key.end)
                    if (st.type === 'newline')
                        return true;
            return false;
        case 'flow-collection':
            for (const it of key.items) {
                for (const st of it.start)
                    if (st.type === 'newline')
                        return true;
                if (it.sep)
                    for (const st of it.sep)
                        if (st.type === 'newline')
                            return true;
                if (containsNewline(it.key) || containsNewline(it.value))
                    return true;
            }
            return false;
        default:
            return true;
    }
}

function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === 'flow-collection') {
        const end = fc.end[0];
        if (end.indent === indent &&
            (end.source === ']' || end.source === '}') &&
            containsNewline(fc)) {
            const msg = 'Flow end indicator should be more indented than parent';
            onError(end, 'BAD_INDENT', msg, true);
        }
    }
}

function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
        return false;
    const isEqual = typeof uniqueKeys === 'function'
        ? uniqueKeys
        : (a, b) => a === b ||
            (isScalar(a) &&
                isScalar(b) &&
                a.value === b.value &&
                !(a.value === '<<' && ctx.schema.merge));
    return items.some(pair => isEqual(pair.key, search));
}

const startColMsg = 'All mapping items must start at the same column';
function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        // key properties
        const keyProps = resolveProps(start, {
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
            if (key) {
                if (key.type === 'block-seq')
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
                else if ('indent' in key && key.indent !== bm.indent)
                    onError(offset, 'BAD_INDENT', startColMsg);
            }
            if (!keyProps.anchor && !keyProps.tag && !sep) {
                commentEnd = keyProps.end;
                if (keyProps.comment) {
                    if (map.comment)
                        map.comment += '\n' + keyProps.comment;
                    else
                        map.comment = keyProps.comment;
                }
                continue;
            }
            if (keyProps.hasNewlineAfterProp || containsNewline(key)) {
                onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
            }
        }
        else if (keyProps.found?.indent !== bm.indent) {
            onError(offset, 'BAD_INDENT', startColMsg);
        }
        // key value
        const keyStart = keyProps.end;
        const keyNode = key
            ? composeNode(ctx, key, keyProps, onError)
            : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
            flowIndentCheck(bm.indent, key, onError);
        if (mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
        // value properties
        const valueProps = resolveProps(sep ?? [], {
            indicator: 'map-value-ind',
            next: value,
            offset: keyNode.range[2],
            onError,
            startOnNewline: !key || key.type === 'block-scalar'
        });
        offset = valueProps.end;
        if (valueProps.found) {
            if (implicitKey) {
                if (value?.type === 'block-map' && !valueProps.hasNewline)
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
                if (ctx.options.strict &&
                    keyProps.start < valueProps.found.offset - 1024)
                    onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
            if (ctx.schema.compat)
                flowIndentCheck(bm.indent, value, onError);
            offset = valueNode.range[2];
            const pair = new Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
        else {
            // key with no value
            if (implicitKey)
                onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
            if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new Pair(keyNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
    }
    if (commentEnd && commentEnd < offset)
        onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
}

function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
        const props = resolveProps(start, {
            indicator: 'seq-item-ind',
            next: value,
            offset,
            onError,
            startOnNewline: true
        });
        if (!props.found) {
            if (props.anchor || props.tag || value) {
                if (value && value.type === 'block-seq')
                    onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
                else
                    onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
            }
            else {
                commentEnd = props.end;
                if (props.comment)
                    seq.comment = props.comment;
                continue;
            }
        }
        const node = value
            ? composeNode(ctx, value, props, onError)
            : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
            flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
}

function resolveEnd(end, offset, reqSpace, onError) {
    let comment = '';
    if (end) {
        let hasSpace = false;
        let sep = '';
        for (const token of end) {
            const { source, type } = token;
            switch (type) {
                case 'space':
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (reqSpace && !hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += sep + cb;
                    sep = '';
                    break;
                }
                case 'newline':
                    if (comment)
                        sep += source;
                    hasSpace = true;
                    break;
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
            }
            offset += source.length;
        }
    }
    return { comment, offset };
}

const blockMsg = 'Block collections are not allowed within flow collections';
const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === '{';
    const fcName = isMap ? 'flow map' : 'flow sequence';
    const NodeClass = (tag?.nodeClass ?? (isMap ? YAMLMap : YAMLSeq));
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
        ctx.atRoot = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps(start, {
            flow: fcName,
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            startOnNewline: false
        });
        if (!props.found) {
            if (!props.anchor && !props.tag && !sep && !value) {
                if (i === 0 && props.comma)
                    onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
                else if (i < fc.items.length - 1)
                    onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
                if (props.comment) {
                    if (coll.comment)
                        coll.comment += '\n' + props.comment;
                    else
                        coll.comment = props.comment;
                }
                offset = props.end;
                continue;
            }
            if (!isMap && ctx.options.strict && containsNewline(key))
                onError(key, // checked by containsNewline()
                'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
        }
        if (i === 0) {
            if (props.comma)
                onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
        }
        else {
            if (!props.comma)
                onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
            if (props.comment) {
                let prevItemComment = '';
                loop: for (const st of start) {
                    switch (st.type) {
                        case 'comma':
                        case 'space':
                            break;
                        case 'comment':
                            prevItemComment = st.source.substring(1);
                            break loop;
                        default:
                            break loop;
                    }
                }
                if (prevItemComment) {
                    let prev = coll.items[coll.items.length - 1];
                    if (isPair(prev))
                        prev = prev.value ?? prev.key;
                    if (prev.comment)
                        prev.comment += '\n' + prevItemComment;
                    else
                        prev.comment = prevItemComment;
                    props.comment = props.comment.substring(prevItemComment.length + 1);
                }
            }
        }
        if (!isMap && !sep && !props.found) {
            // item is a value in a seq
            // → key & sep are empty, start does not include ? or :
            const valueNode = value
                ? composeNode(ctx, value, props, onError)
                : composeEmptyNode(ctx, props.end, sep, null, props, onError);
            coll.items.push(valueNode);
            offset = valueNode.range[2];
            if (isBlock(value))
                onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
        }
        else {
            // item is a key+value pair
            // key value
            const keyStart = props.end;
            const keyNode = key
                ? composeNode(ctx, key, props, onError)
                : composeEmptyNode(ctx, keyStart, start, null, props, onError);
            if (isBlock(key))
                onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
            // value properties
            const valueProps = resolveProps(sep ?? [], {
                flow: fcName,
                indicator: 'map-value-ind',
                next: value,
                offset: keyNode.range[2],
                onError,
                startOnNewline: false
            });
            if (valueProps.found) {
                if (!isMap && !props.found && ctx.options.strict) {
                    if (sep)
                        for (const st of sep) {
                            if (st === valueProps.found)
                                break;
                            if (st.type === 'newline') {
                                onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
                                break;
                            }
                        }
                    if (props.start < valueProps.found.offset - 1024)
                        onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
                }
            }
            else if (value) {
                if ('source' in value && value.source && value.source[0] === ':')
                    onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
                else
                    onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : valueProps.found
                    ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
                    : null;
            if (valueNode) {
                if (isBlock(value))
                    onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
            }
            else if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            if (isMap) {
                const map = coll;
                if (mapIncludes(ctx, map.items, keyNode))
                    onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
                map.items.push(pair);
            }
            else {
                const map = new YAMLMap(ctx.schema);
                map.flow = true;
                map.items.push(pair);
                coll.items.push(map);
            }
            offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
    }
    const expectedEnd = isMap ? '}' : ']';
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce && ce.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
    else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot
            ? `${name} must end with a ${expectedEnd}`
            : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
        if (ce && ce.source.length !== 1)
            ee.unshift(ce);
    }
    if (ee.length > 0) {
        const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
            if (coll.comment)
                coll.comment += '\n' + end.comment;
            else
                coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
    }
    else {
        coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
}

function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === 'block-map'
        ? resolveBlockMap(CN, ctx, token, onError, tag)
        : token.type === 'block-seq'
            ? resolveBlockSeq(CN, ctx, token, onError, tag)
            : resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    // If we got a tagName matching the class, or the tag name is '!',
    // then use the tagName from the node class used to create it.
    if (tagName === '!' || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
    }
    if (tagName)
        coll.tag = tagName;
    return coll;
}
function composeCollection(CN, ctx, token, tagToken, onError) {
    const tagName = !tagToken
        ? null
        : ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
    const expType = token.type === 'block-map'
        ? 'map'
        : token.type === 'block-seq'
            ? 'seq'
            : token.start.source === '{'
                ? 'map'
                : 'seq';
    // shortcut: check if it's a generic YAMLMap or YAMLSeq
    // before jumping into the custom tag logic.
    if (!tagToken ||
        !tagName ||
        tagName === '!' ||
        (tagName === YAMLMap.tagName && expType === 'map') ||
        (tagName === YAMLSeq.tagName && expType === 'seq') ||
        !expType) {
        return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find(t => t.tag === tagName && t.collection === expType);
    if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt && kt.collection === expType) {
            ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
            tag = kt;
        }
        else {
            if (kt?.collection) {
                onError(tagToken, 'BAD_COLLECTION_TYPE', `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
            }
            else {
                onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
            }
            return resolveCollection(CN, ctx, token, onError, tagName);
        }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options) ?? coll;
    const node = isNode(res)
        ? res
        : new Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
        node.format = tag.format;
    return node;
}

function resolveBlockScalar(scalar, strict, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, strict, onError);
    if (!header)
        return { value: '', type: null, comment: '', range: [start, start, start] };
    const type = header.mode === '>' ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    // determine the end of content & start of chomping
    let chompStart = lines.length;
    for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === '' || content === '\r')
            chompStart = i;
        else
            break;
    }
    // shortcut for empty contents
    if (chompStart === 0) {
        const value = header.chomp === '+' && lines.length > 0
            ? '\n'.repeat(Math.max(1, lines.length - 1))
            : '';
        let end = start + header.length;
        if (scalar.source)
            end += scalar.source.length;
        return { value, type, comment: header.comment, range: [start, end, end] };
    }
    // find the indentation level to trim from start
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === '' || content === '\r') {
            if (header.indent === 0 && indent.length > trimIndent)
                trimIndent = indent.length;
        }
        else {
            if (indent.length < trimIndent) {
                const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
                onError(offset + indent.length, 'MISSING_CHAR', message);
            }
            if (header.indent === 0)
                trimIndent = indent.length;
            contentStart = i;
            break;
        }
        offset += indent.length + content.length + 1;
    }
    // include trailing more-indented empty lines in content
    for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
            chompStart = i + 1;
    }
    let value = '';
    let sep = '';
    let prevMoreIndented = false;
    // leading whitespace is kept intact
    for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + '\n';
    for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === '\r';
        if (crlf)
            content = content.slice(0, -1);
        /* istanbul ignore if already caught in lexer */
        if (content && indent.length < trimIndent) {
            const src = header.indent
                ? 'explicit indentation indicator'
                : 'first line';
            const message = `Block scalar lines must not be less indented than their ${src}`;
            onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
            indent = '';
        }
        if (type === Scalar.BLOCK_LITERAL) {
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
        }
        else if (indent.length > trimIndent || content[0] === '\t') {
            // more-indented content within a folded block
            if (sep === ' ')
                sep = '\n';
            else if (!prevMoreIndented && sep === '\n')
                sep = '\n\n';
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
            prevMoreIndented = true;
        }
        else if (content === '') {
            // empty line
            if (sep === '\n')
                value += '\n';
            else
                sep = '\n';
        }
        else {
            value += sep + content;
            sep = ' ';
            prevMoreIndented = false;
        }
    }
    switch (header.chomp) {
        case '-':
            break;
        case '+':
            for (let i = chompStart; i < lines.length; ++i)
                value += '\n' + lines[i][0].slice(trimIndent);
            if (value[value.length - 1] !== '\n')
                value += '\n';
            break;
        default:
            value += '\n';
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
    /* istanbul ignore if should not happen */
    if (props[0].type !== 'block-scalar-header') {
        onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
        return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = '';
    let error = -1;
    for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === '-' || ch === '+'))
            chomp = ch;
        else {
            const n = Number(ch);
            if (!indent && n)
                indent = n;
            else if (error === -1)
                error = offset + i;
        }
    }
    if (error !== -1)
        onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = '';
    let length = source.length;
    for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
            case 'space':
                hasSpace = true;
            // fallthrough
            case 'newline':
                length += token.source.length;
                break;
            case 'comment':
                if (strict && !hasSpace) {
                    const message = 'Comments must be separated from other tokens by white space characters';
                    onError(token, 'MISSING_CHAR', message);
                }
                length += token.source.length;
                comment = token.source.substring(1);
                break;
            case 'error':
                onError(token, 'UNEXPECTED_TOKEN', token.message);
                length += token.source.length;
                break;
            /* istanbul ignore next should not happen */
            default: {
                const message = `Unexpected token in block scalar header: ${token.type}`;
                onError(token, 'UNEXPECTED_TOKEN', message);
                const ts = token.source;
                if (ts && typeof ts === 'string')
                    length += ts.length;
            }
        }
    }
    return { mode, indent, chomp, comment, length };
}
/** @returns Array of lines split up as `[indent, content]` */
function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1]
        ? [m[1], first.slice(m[1].length)]
        : ['', first];
    const lines = [line0];
    for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
    return lines;
}

function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
        case 'scalar':
            _type = Scalar.PLAIN;
            value = plainValue(source, _onError);
            break;
        case 'single-quoted-scalar':
            _type = Scalar.QUOTE_SINGLE;
            value = singleQuotedValue(source, _onError);
            break;
        case 'double-quoted-scalar':
            _type = Scalar.QUOTE_DOUBLE;
            value = doubleQuotedValue(source, _onError);
            break;
        /* istanbul ignore next should not happen */
        default:
            onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
            return {
                value: '',
                type: null,
                comment: '',
                range: [offset, offset + source.length, offset + source.length]
            };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd(end, valueEnd, strict, onError);
    return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
    };
}
function plainValue(source, onError) {
    let badChar = '';
    switch (source[0]) {
        /* istanbul ignore next should not happen */
        case '\t':
            badChar = 'a tab character';
            break;
        case ',':
            badChar = 'flow indicator character ,';
            break;
        case '%':
            badChar = 'directive indicator character %';
            break;
        case '|':
        case '>': {
            badChar = `block scalar indicator ${source[0]}`;
            break;
        }
        case '@':
        case '`': {
            badChar = `reserved character ${source[0]}`;
            break;
        }
    }
    if (badChar)
        onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
    return foldLines(source);
}
function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
    /**
     * The negative lookbehind here and in the `re` RegExp is to
     * prevent causing a polynomial search time in certain cases.
     *
     * The try-catch is for Safari, which doesn't support this yet:
     * https://caniuse.com/js-regexp-lookbehind
     */
    let first, line;
    try {
        first = new RegExp('(.*?)(?<![ \t])[ \t]*\r?\n', 'sy');
        line = new RegExp('[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?\n', 'sy');
    }
    catch (_) {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
        return source;
    let res = match[1];
    let sep = ' ';
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while ((match = line.exec(source))) {
        if (match[1] === '') {
            if (sep === '\n')
                res += sep;
            else
                sep = '\n';
        }
        else {
            res += sep + match[1];
            sep = ' ';
        }
        pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? '');
}
function doubleQuotedValue(source, onError) {
    let res = '';
    for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === '\r' && source[i + 1] === '\n')
            continue;
        if (ch === '\n') {
            const { fold, offset } = foldNewline(source, i);
            res += fold;
            i = offset;
        }
        else if (ch === '\\') {
            let next = source[++i];
            const cc = escapeCodes[next];
            if (cc)
                res += cc;
            else if (next === '\n') {
                // skip escaped newlines, but still trim the following line
                next = source[i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === '\r' && source[i + 1] === '\n') {
                // skip escaped CRLF newlines, but still trim the following line
                next = source[++i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === 'x' || next === 'u' || next === 'U') {
                const length = { x: 2, u: 4, U: 8 }[next];
                res += parseCharCode(source, i + 1, length, onError);
                i += length;
            }
            else {
                const raw = source.substr(i - 1, 2);
                onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
                res += raw;
            }
        }
        else if (ch === ' ' || ch === '\t') {
            // trim trailing whitespace
            const wsStart = i;
            let next = source[i + 1];
            while (next === ' ' || next === '\t')
                next = source[++i + 1];
            if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
                res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        }
        else {
            res += ch;
        }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
    return res;
}
/**
 * Fold a single newline into a space, multiple newlines to N - 1 newlines.
 * Presumes `source[offset] === '\n'`
 */
function foldNewline(source, offset) {
    let fold = '';
    let ch = source[offset + 1];
    while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        if (ch === '\r' && source[offset + 2] !== '\n')
            break;
        if (ch === '\n')
            fold += '\n';
        offset += 1;
        ch = source[offset + 1];
    }
    if (!fold)
        fold = ' ';
    return { fold, offset };
}
const escapeCodes = {
    '0': '\0',
    a: '\x07',
    b: '\b',
    e: '\x1b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    N: '\u0085',
    _: '\u00a0',
    L: '\u2028',
    P: '\u2029',
    ' ': ' ',
    '"': '"',
    '/': '/',
    '\\': '\\',
    '\t': '\t'
};
function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
        return raw;
    }
    return String.fromCodePoint(code);
}

function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === 'block-scalar'
        ? resolveBlockScalar(token, ctx.options.strict, onError)
        : resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken
        ? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
        : null;
    const tag = tagToken && tagName
        ? findScalarTagByName(ctx.schema, value, tagName, tagToken, onError)
        : token.type === 'scalar'
            ? findScalarTagByTest(ctx, value, token, onError)
            : ctx.schema[SCALAR$1];
    let scalar;
    try {
        const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
        scalar = isScalar(res) ? res : new Scalar(res);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
        scalar = new Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
        scalar.type = type;
    if (tagName)
        scalar.tag = tagName;
    if (tag.format)
        scalar.format = tag.format;
    if (comment)
        scalar.comment = comment;
    return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === '!')
        return schema[SCALAR$1]; // non-specific tag
    const matchWithTest = [];
    for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
            if (tag.default && tag.test)
                matchWithTest.push(tag);
            else
                return tag;
        }
    }
    for (const tag of matchWithTest)
        if (tag.test?.test(value))
            return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
        // Ensure that the known tag is available for stringifying,
        // but does not get used by default.
        schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
        return kt;
    }
    onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
    return schema[SCALAR$1];
}
function findScalarTagByTest({ directives, schema }, value, token, onError) {
    const tag = schema.tags.find(tag => tag.default && tag.test?.test(value)) || schema[SCALAR$1];
    if (schema.compat) {
        const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
            schema[SCALAR$1];
        if (tag.tag !== compat.tag) {
            const ts = directives.tagString(tag.tag);
            const cs = directives.tagString(compat.tag);
            const msg = `Value may be parsed as either ${ts} or ${cs}`;
            onError(token, 'TAG_RESOLVE_FAILED', msg, true);
        }
    }
    return tag;
}

function emptyScalarPosition(offset, before, pos) {
    if (before) {
        if (pos === null)
            pos = before.length;
        for (let i = pos - 1; i >= 0; --i) {
            let st = before[i];
            switch (st.type) {
                case 'space':
                case 'comment':
                case 'newline':
                    offset -= st.source.length;
                    continue;
            }
            // Technically, an empty scalar is immediately after the last non-empty
            // node, but it's more useful to place it after any whitespace.
            st = before[++i];
            while (st?.type === 'space') {
                offset += st.source.length;
                st = before[++i];
            }
            break;
        }
    }
    return offset;
}

const CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
        case 'alias':
            node = composeAlias(ctx, token, onError);
            if (anchor || tag)
                onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
            break;
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'block-scalar':
            node = composeScalar(ctx, token, tag, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        case 'block-map':
        case 'block-seq':
        case 'flow-collection':
            node = composeCollection(CN, ctx, token, tag, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        default: {
            const message = token.type === 'error'
                ? token.message
                : `Unsupported token (type: ${token.type})`;
            onError(token, 'UNEXPECTED_TOKEN', message);
            node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
            isSrcToken = false;
        }
    }
    if (anchor && node.anchor === '')
        onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        if (token.type === 'scalar' && token.source === '')
            node.comment = comment;
        else
            node.commentBefore = comment;
    }
    // @ts-expect-error Type checking misses meaning of isSrcToken
    if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
    return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
        type: 'scalar',
        offset: emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ''
    };
    const node = composeScalar(ctx, token, tag, onError);
    if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === '')
            onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        node.comment = comment;
        node.range[2] = end;
    }
    return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias(source.substring(1));
    if (alias.source === '')
        onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
    if (alias.source.endsWith(':'))
        onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
    const valueEnd = offset + source.length;
    const re = resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
        alias.comment = re.comment;
    return alias;
}

function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document(undefined, opts);
    const ctx = {
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
    };
    const props = resolveProps(start, {
        indicator: 'doc-start',
        next: value ?? end?.[0],
        offset,
        onError,
        startOnNewline: true
    });
    if (props.found) {
        doc.directives.docStart = true;
        if (value &&
            (value.type === 'block-map' || value.type === 'block-seq') &&
            !props.hasNewline)
            onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
    }
    // @ts-expect-error If Contents is set, let's trust the user
    doc.contents = value
        ? composeNode(ctx, value, props, onError)
        : composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
        doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
}

function getErrorPos(src) {
    if (typeof src === 'number')
        return [src, src + 1];
    if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === 'string' ? source.length : 1)];
}
function parsePrelude(prelude) {
    let comment = '';
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
            case '#':
                comment +=
                    (comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
                        (source.substring(1) || ' ');
                atComment = true;
                afterEmptyLine = false;
                break;
            case '%':
                if (prelude[i + 1]?.[0] !== '#')
                    i += 1;
                atComment = false;
                break;
            default:
                // This may be wrong after doc-end, but in that case it doesn't matter
                if (!atComment)
                    afterEmptyLine = true;
                atComment = false;
        }
    }
    return { comment, afterEmptyLine };
}
/**
 * Compose a stream of CST nodes into a stream of YAML Documents.
 *
 * ```ts
 * import { Composer, Parser } from 'yaml'
 *
 * const src: string = ...
 * const tokens = new Parser().parse(src)
 * const docs = new Composer().compose(tokens)
 * ```
 */
class Composer {
    constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
            const pos = getErrorPos(source);
            if (warning)
                this.warnings.push(new YAMLWarning(pos, code, message));
            else
                this.errors.push(new YAMLParseError(pos, code, message));
        };
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        this.directives = new Directives({ version: options.version || '1.2' });
        this.options = options;
    }
    decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        //console.log({ dc: doc.comment, prelude, comment })
        if (comment) {
            const dc = doc.contents;
            if (afterDoc) {
                doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
            }
            else if (afterEmptyLine || doc.directives.docStart || !dc) {
                doc.commentBefore = comment;
            }
            else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
                let it = dc.items[0];
                if (isPair(it))
                    it = it.key;
                const cb = it.commentBefore;
                it.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
            else {
                const cb = dc.commentBefore;
                dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
        }
        if (afterDoc) {
            Array.prototype.push.apply(doc.errors, this.errors);
            Array.prototype.push.apply(doc.warnings, this.warnings);
        }
        else {
            doc.errors = this.errors;
            doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
        return {
            comment: parsePrelude(this.prelude).comment,
            directives: this.directives,
            errors: this.errors,
            warnings: this.warnings
        };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
            yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
    }
    /** Advance the composer by one CST token. */
    *next(token) {
        switch (token.type) {
            case 'directive':
                this.directives.add(token.source, (offset, message, warning) => {
                    const pos = getErrorPos(token);
                    pos[0] += offset;
                    this.onError(pos, 'BAD_DIRECTIVE', message, warning);
                });
                this.prelude.push(token.source);
                this.atDirectives = true;
                break;
            case 'document': {
                const doc = composeDoc(this.options, this.directives, token, this.onError);
                if (this.atDirectives && !doc.directives.docStart)
                    this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
                this.decorate(doc, false);
                if (this.doc)
                    yield this.doc;
                this.doc = doc;
                this.atDirectives = false;
                break;
            }
            case 'byte-order-mark':
            case 'space':
                break;
            case 'comment':
            case 'newline':
                this.prelude.push(token.source);
                break;
            case 'error': {
                const msg = token.source
                    ? `${token.message}: ${JSON.stringify(token.source)}`
                    : token.message;
                const error = new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
                if (this.atDirectives || !this.doc)
                    this.errors.push(error);
                else
                    this.doc.errors.push(error);
                break;
            }
            case 'doc-end': {
                if (!this.doc) {
                    const msg = 'Unexpected doc-end without preceding document';
                    this.errors.push(new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
                    break;
                }
                this.doc.directives.docEnd = true;
                const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
                this.decorate(this.doc, true);
                if (end.comment) {
                    const dc = this.doc.comment;
                    this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
                }
                this.doc.range[2] = end.offset;
                break;
            }
            default:
                this.errors.push(new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
        }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
            this.decorate(this.doc, true);
            yield this.doc;
            this.doc = null;
        }
        else if (forceDoc) {
            const opts = Object.assign({ _directives: this.directives }, this.options);
            const doc = new Document(undefined, opts);
            if (this.atDirectives)
                this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
            doc.range = [0, endOffset, endOffset];
            this.decorate(doc, false);
            yield doc;
        }
    }
}

/** The byte order mark */
const BOM = '\u{FEFF}';
/** Start of doc-mode */
const DOCUMENT = '\x02'; // C0: Start of Text
/** Unexpected end of flow-mode */
const FLOW_END = '\x18'; // C0: Cancel
/** Next token is a scalar value */
const SCALAR = '\x1f'; // C0: Unit Separator
/** Identify the type of a lexer token. May return `null` for unknown tokens. */
function tokenType(source) {
    switch (source) {
        case BOM:
            return 'byte-order-mark';
        case DOCUMENT:
            return 'doc-mode';
        case FLOW_END:
            return 'flow-error-end';
        case SCALAR:
            return 'scalar';
        case '---':
            return 'doc-start';
        case '...':
            return 'doc-end';
        case '':
        case '\n':
        case '\r\n':
            return 'newline';
        case '-':
            return 'seq-item-ind';
        case '?':
            return 'explicit-key-ind';
        case ':':
            return 'map-value-ind';
        case '{':
            return 'flow-map-start';
        case '}':
            return 'flow-map-end';
        case '[':
            return 'flow-seq-start';
        case ']':
            return 'flow-seq-end';
        case ',':
            return 'comma';
    }
    switch (source[0]) {
        case ' ':
        case '\t':
            return 'space';
        case '#':
            return 'comment';
        case '%':
            return 'directive-line';
        case '*':
            return 'alias';
        case '&':
            return 'anchor';
        case '!':
            return 'tag';
        case "'":
            return 'single-quoted-scalar';
        case '"':
            return 'double-quoted-scalar';
        case '|':
        case '>':
            return 'block-scalar-header';
    }
    return null;
}

/*
START -> stream

stream
  directive -> line-end -> stream
  indent + line-end -> stream
  [else] -> line-start

line-end
  comment -> line-end
  newline -> .
  input-end -> END

line-start
  doc-start -> doc
  doc-end -> stream
  [else] -> indent -> block-start

block-start
  seq-item-start -> block-start
  explicit-key-start -> block-start
  map-value-start -> block-start
  [else] -> doc

doc
  line-end -> line-start
  spaces -> doc
  anchor -> doc
  tag -> doc
  flow-start -> flow -> doc
  flow-end -> error -> doc
  seq-item-start -> error -> doc
  explicit-key-start -> error -> doc
  map-value-start -> doc
  alias -> doc
  quote-start -> quoted-scalar -> doc
  block-scalar-header -> line-end -> block-scalar(min) -> line-start
  [else] -> plain-scalar(false, min) -> doc

flow
  line-end -> flow
  spaces -> flow
  anchor -> flow
  tag -> flow
  flow-start -> flow -> flow
  flow-end -> .
  seq-item-start -> error -> flow
  explicit-key-start -> flow
  map-value-start -> flow
  alias -> flow
  quote-start -> quoted-scalar -> flow
  comma -> flow
  [else] -> plain-scalar(true, 0) -> flow

quoted-scalar
  quote-end -> .
  [else] -> quoted-scalar

block-scalar(min)
  newline + peek(indent < min) -> .
  [else] -> block-scalar(min)

plain-scalar(is-flow, min)
  scalar-end(is-flow) -> .
  peek(newline + (indent < min)) -> .
  [else] -> plain-scalar(min)
*/
function isEmpty(ch) {
    switch (ch) {
        case undefined:
        case ' ':
        case '\n':
        case '\r':
        case '\t':
            return true;
        default:
            return false;
    }
}
const hexDigits = '0123456789ABCDEFabcdef'.split('');
const tagChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split('');
const invalidFlowScalarChars = ',[]{}'.split('');
const invalidAnchorChars = ' ,[]{}\n\r\t'.split('');
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.includes(ch);
/**
 * Splits an input string into lexical tokens, i.e. smaller strings that are
 * easily identifiable by `tokens.tokenType()`.
 *
 * Lexing starts always in a "stream" context. Incomplete input may be buffered
 * until a complete token can be emitted.
 *
 * In addition to slices of the original input, the following control characters
 * may also be emitted:
 *
 * - `\x02` (Start of Text): A document starts with the next token
 * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
 * - `\x1f` (Unit Separator): Next token is a scalar value
 * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
 */
class Lexer {
    constructor() {
        /**
         * Flag indicating whether the end of the current buffer marks the end of
         * all input
         */
        this.atEnd = false;
        /**
         * Explicit indent set in block scalar header, as an offset from the current
         * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
         * explicitly set.
         */
        this.blockScalarIndent = -1;
        /**
         * Block scalars that include a + (keep) chomping indicator in their header
         * include trailing empty lines, which are otherwise excluded from the
         * scalar's contents.
         */
        this.blockScalarKeep = false;
        /** Current input */
        this.buffer = '';
        /**
         * Flag noting whether the map value indicator : can immediately follow this
         * node within a flow context.
         */
        this.flowKey = false;
        /** Count of surrounding flow collection levels. */
        this.flowLevel = 0;
        /**
         * Minimum level of indentation required for next lines to be parsed as a
         * part of the current scalar value.
         */
        this.indentNext = 0;
        /** Indentation level of the current line. */
        this.indentValue = 0;
        /** Position of the next \n character. */
        this.lineEndPos = null;
        /** Stores the state of the lexer if reaching the end of incpomplete input */
        this.next = null;
        /** A pointer to `buffer`; the current position of the lexer. */
        this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(source, incomplete = false) {
        if (source) {
            this.buffer = this.buffer ? this.buffer + source : source;
            this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? 'stream';
        while (next && (incomplete || this.hasChars(1)))
            next = yield* this.parseNext(next);
    }
    atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === ' ' || ch === '\t')
            ch = this.buffer[++i];
        if (!ch || ch === '#' || ch === '\n')
            return true;
        if (ch === '\r')
            return this.buffer[i + 1] === '\n';
        return false;
    }
    charAt(n) {
        return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
            let indent = 0;
            while (ch === ' ')
                ch = this.buffer[++indent + offset];
            if (ch === '\r') {
                const next = this.buffer[indent + offset + 1];
                if (next === '\n' || (!next && !this.atEnd))
                    return offset + indent + 1;
            }
            return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
                ? offset + indent
                : -1;
        }
        if (ch === '-' || ch === '.') {
            const dt = this.buffer.substr(offset, 3);
            if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
                return -1;
        }
        return offset;
    }
    getLine() {
        let end = this.lineEndPos;
        if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
            end = this.buffer.indexOf('\n', this.pos);
            this.lineEndPos = end;
        }
        if (end === -1)
            return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === '\r')
            end -= 1;
        return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
        return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
    }
    peek(n) {
        return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
        switch (next) {
            case 'stream':
                return yield* this.parseStream();
            case 'line-start':
                return yield* this.parseLineStart();
            case 'block-start':
                return yield* this.parseBlockStart();
            case 'doc':
                return yield* this.parseDocument();
            case 'flow':
                return yield* this.parseFlowCollection();
            case 'quoted-scalar':
                return yield* this.parseQuotedScalar();
            case 'block-scalar':
                return yield* this.parseBlockScalar();
            case 'plain-scalar':
                return yield* this.parsePlainScalar();
        }
    }
    *parseStream() {
        let line = this.getLine();
        if (line === null)
            return this.setNext('stream');
        if (line[0] === BOM) {
            yield* this.pushCount(1);
            line = line.substring(1);
        }
        if (line[0] === '%') {
            let dirEnd = line.length;
            const cs = line.indexOf('#');
            if (cs !== -1) {
                const ch = line[cs - 1];
                if (ch === ' ' || ch === '\t')
                    dirEnd = cs - 1;
            }
            while (true) {
                const ch = line[dirEnd - 1];
                if (ch === ' ' || ch === '\t')
                    dirEnd -= 1;
                else
                    break;
            }
            const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
            yield* this.pushCount(line.length - n); // possible comment
            this.pushNewline();
            return 'stream';
        }
        if (this.atLineEnd()) {
            const sp = yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - sp);
            yield* this.pushNewline();
            return 'stream';
        }
        yield DOCUMENT;
        return yield* this.parseLineStart();
    }
    *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
            return this.setNext('line-start');
        if (ch === '-' || ch === '.') {
            if (!this.atEnd && !this.hasChars(4))
                return this.setNext('line-start');
            const s = this.peek(3);
            if (s === '---' && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                this.indentValue = 0;
                this.indentNext = 0;
                return 'doc';
            }
            else if (s === '...' && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                return 'stream';
            }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
            this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
            return this.setNext('block-start');
        if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
            const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
            this.indentNext = this.indentValue + 1;
            this.indentValue += n;
            return yield* this.parseBlockStart();
        }
        return 'doc';
    }
    *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
            return this.setNext('doc');
        let n = yield* this.pushIndicators();
        switch (line[n]) {
            case '#':
                yield* this.pushCount(line.length - n);
            // fallthrough
            case undefined:
                yield* this.pushNewline();
                return yield* this.parseLineStart();
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel = 1;
                return 'flow';
            case '}':
            case ']':
                // this is an error
                yield* this.pushCount(1);
                return 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'doc';
            case '"':
            case "'":
                return yield* this.parseQuotedScalar();
            case '|':
            case '>':
                n += yield* this.parseBlockScalarHeader();
                n += yield* this.pushSpaces(true);
                yield* this.pushCount(line.length - n);
                yield* this.pushNewline();
                return yield* this.parseBlockScalar();
            default:
                return yield* this.parsePlainScalar();
        }
    }
    *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
            nl = yield* this.pushNewline();
            if (nl > 0) {
                sp = yield* this.pushSpaces(false);
                this.indentValue = indent = sp;
            }
            else {
                sp = 0;
            }
            sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
            return this.setNext('flow');
        if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
            (indent === 0 &&
                (line.startsWith('---') || line.startsWith('...')) &&
                isEmpty(line[3]))) {
            // Allowing for the terminal ] or } at the same (rather than greater)
            // indent level as the initial [ or { is technically invalid, but
            // failing here would be surprising to users.
            const atFlowEndMarker = indent === this.indentNext - 1 &&
                this.flowLevel === 1 &&
                (line[0] === ']' || line[0] === '}');
            if (!atFlowEndMarker) {
                // this is an error
                this.flowLevel = 0;
                yield FLOW_END;
                return yield* this.parseLineStart();
            }
        }
        let n = 0;
        while (line[n] === ',') {
            n += yield* this.pushCount(1);
            n += yield* this.pushSpaces(true);
            this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
            case undefined:
                return 'flow';
            case '#':
                yield* this.pushCount(line.length - n);
                return 'flow';
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel += 1;
                return 'flow';
            case '}':
            case ']':
                yield* this.pushCount(1);
                this.flowKey = true;
                this.flowLevel -= 1;
                return this.flowLevel ? 'flow' : 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'flow';
            case '"':
            case "'":
                this.flowKey = true;
                return yield* this.parseQuotedScalar();
            case ':': {
                const next = this.charAt(1);
                if (this.flowKey || isEmpty(next) || next === ',') {
                    this.flowKey = false;
                    yield* this.pushCount(1);
                    yield* this.pushSpaces(true);
                    return 'flow';
                }
            }
            // fallthrough
            default:
                this.flowKey = false;
                return yield* this.parsePlainScalar();
        }
    }
    *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
            while (end !== -1 && this.buffer[end + 1] === "'")
                end = this.buffer.indexOf("'", end + 2);
        }
        else {
            // double-quote
            while (end !== -1) {
                let n = 0;
                while (this.buffer[end - 1 - n] === '\\')
                    n += 1;
                if (n % 2 === 0)
                    break;
                end = this.buffer.indexOf('"', end + 1);
            }
        }
        // Only looking for newlines within the quotes
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf('\n', this.pos);
        if (nl !== -1) {
            while (nl !== -1) {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = qb.indexOf('\n', cs);
            }
            if (nl !== -1) {
                // this is an error caused by an unexpected unindent
                end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
            }
        }
        if (end === -1) {
            if (!this.atEnd)
                return this.setNext('quoted-scalar');
            end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? 'flow' : 'doc';
    }
    *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
            const ch = this.buffer[++i];
            if (ch === '+')
                this.blockScalarKeep = true;
            else if (ch > '0' && ch <= '9')
                this.blockScalarIndent = Number(ch) - 1;
            else if (ch !== '-')
                break;
        }
        return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
    }
    *parseBlockScalar() {
        let nl = this.pos - 1; // may be -1 if this.pos === 0
        let indent = 0;
        let ch;
        loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
            switch (ch) {
                case ' ':
                    indent += 1;
                    break;
                case '\n':
                    nl = i;
                    indent = 0;
                    break;
                case '\r': {
                    const next = this.buffer[i + 1];
                    if (!next && !this.atEnd)
                        return this.setNext('block-scalar');
                    if (next === '\n')
                        break;
                } // fallthrough
                default:
                    break loop;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('block-scalar');
        if (indent >= this.indentNext) {
            if (this.blockScalarIndent === -1)
                this.indentNext = indent;
            else
                this.indentNext += this.blockScalarIndent;
            do {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = this.buffer.indexOf('\n', cs);
            } while (nl !== -1);
            if (nl === -1) {
                if (!this.atEnd)
                    return this.setNext('block-scalar');
                nl = this.buffer.length;
            }
        }
        if (!this.blockScalarKeep) {
            do {
                let i = nl - 1;
                let ch = this.buffer[i];
                if (ch === '\r')
                    ch = this.buffer[--i];
                const lastChar = i; // Drop the line if last char not more indented
                while (ch === ' ' || ch === '\t')
                    ch = this.buffer[--i];
                if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
                    nl = i;
                else
                    break;
            } while (true);
        }
        yield SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while ((ch = this.buffer[++i])) {
            if (ch === ':') {
                const next = this.buffer[i + 1];
                if (isEmpty(next) || (inFlow && next === ','))
                    break;
                end = i;
            }
            else if (isEmpty(ch)) {
                let next = this.buffer[i + 1];
                if (ch === '\r') {
                    if (next === '\n') {
                        i += 1;
                        ch = '\n';
                        next = this.buffer[i + 1];
                    }
                    else
                        end = i;
                }
                if (next === '#' || (inFlow && invalidFlowScalarChars.includes(next)))
                    break;
                if (ch === '\n') {
                    const cs = this.continueScalar(i + 1);
                    if (cs === -1)
                        break;
                    i = Math.max(i, cs - 2); // to advance, but still account for ' #'
                }
            }
            else {
                if (inFlow && invalidFlowScalarChars.includes(ch))
                    break;
                end = i;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('plain-scalar');
        yield SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? 'flow' : 'doc';
    }
    *pushCount(n) {
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos += n;
            return n;
        }
        return 0;
    }
    *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
            yield s;
            this.pos += s.length;
            return s.length;
        }
        else if (allowEmpty)
            yield '';
        return 0;
    }
    *pushIndicators() {
        switch (this.charAt(0)) {
            case '!':
                return ((yield* this.pushTag()) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '&':
                return ((yield* this.pushUntil(isNotAnchorChar)) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '-': // this is an error
            case '?': // this is an error outside flow collections
            case ':': {
                const inFlow = this.flowLevel > 0;
                const ch1 = this.charAt(1);
                if (isEmpty(ch1) || (inFlow && invalidFlowScalarChars.includes(ch1))) {
                    if (!inFlow)
                        this.indentNext = this.indentValue + 1;
                    else if (this.flowKey)
                        this.flowKey = false;
                    return ((yield* this.pushCount(1)) +
                        (yield* this.pushSpaces(true)) +
                        (yield* this.pushIndicators()));
                }
            }
        }
        return 0;
    }
    *pushTag() {
        if (this.charAt(1) === '<') {
            let i = this.pos + 2;
            let ch = this.buffer[i];
            while (!isEmpty(ch) && ch !== '>')
                ch = this.buffer[++i];
            return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
        }
        else {
            let i = this.pos + 1;
            let ch = this.buffer[i];
            while (ch) {
                if (tagChars.includes(ch))
                    ch = this.buffer[++i];
                else if (ch === '%' &&
                    hexDigits.includes(this.buffer[i + 1]) &&
                    hexDigits.includes(this.buffer[i + 2])) {
                    ch = this.buffer[(i += 3)];
                }
                else
                    break;
            }
            return yield* this.pushToIndex(i, false);
        }
    }
    *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === '\n')
            return yield* this.pushCount(1);
        else if (ch === '\r' && this.charAt(1) === '\n')
            return yield* this.pushCount(2);
        else
            return 0;
    }
    *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
            ch = this.buffer[++i];
        } while (ch === ' ' || (allowTabs && ch === '\t'));
        const n = i - this.pos;
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos = i;
        }
        return n;
    }
    *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
            ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
    }
}

/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
class LineCounter {
    constructor() {
        this.lineStarts = [];
        /**
         * Should be called in ascending order. Otherwise, call
         * `lineCounter.lineStarts.sort()` before calling `linePos()`.
         */
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        /**
         * Performs a binary search and returns the 1-indexed { line, col }
         * position of `offset`. If `line === 0`, `addNewLine` has never been
         * called or `offset` is before the first known newline.
         */
        this.linePos = (offset) => {
            let low = 0;
            let high = this.lineStarts.length;
            while (low < high) {
                const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                if (this.lineStarts[mid] < offset)
                    low = mid + 1;
                else
                    high = mid;
            }
            if (this.lineStarts[low] === offset)
                return { line: low + 1, col: 1 };
            if (low === 0)
                return { line: 0, col: offset };
            const start = this.lineStarts[low - 1];
            return { line: low, col: offset - start + 1 };
        };
    }
}

function includesToken(list, type) {
    for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
            return true;
    return false;
}
function findNonEmptyIndex(list) {
    for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
            case 'space':
            case 'comment':
            case 'newline':
                break;
            default:
                return i;
        }
    }
    return -1;
}
function isFlowToken(token) {
    switch (token?.type) {
        case 'alias':
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'flow-collection':
            return true;
        default:
            return false;
    }
}
function getPrevProps(parent) {
    switch (parent.type) {
        case 'document':
            return parent.start;
        case 'block-map': {
            const it = parent.items[parent.items.length - 1];
            return it.sep ?? it.start;
        }
        case 'block-seq':
            return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
            return [];
    }
}
/** Note: May modify input array */
function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
        return [];
    let i = prev.length;
    loop: while (--i >= 0) {
        switch (prev[i].type) {
            case 'doc-start':
            case 'explicit-key-ind':
            case 'map-value-ind':
            case 'seq-item-ind':
            case 'newline':
                break loop;
        }
    }
    while (prev[++i]?.type === 'space') {
        /* loop */
    }
    return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
    if (fc.start.type === 'flow-seq-start') {
        for (const it of fc.items) {
            if (it.sep &&
                !it.value &&
                !includesToken(it.start, 'explicit-key-ind') &&
                !includesToken(it.sep, 'map-value-ind')) {
                if (it.key)
                    it.value = it.key;
                delete it.key;
                if (isFlowToken(it.value)) {
                    if (it.value.end)
                        Array.prototype.push.apply(it.value.end, it.sep);
                    else
                        it.value.end = it.sep;
                }
                else
                    Array.prototype.push.apply(it.start, it.sep);
                delete it.sep;
            }
        }
    }
}
/**
 * A YAML concrete syntax tree (CST) parser
 *
 * ```ts
 * const src: string = ...
 * for (const token of new Parser().parse(src)) {
 *   // token: Token
 * }
 * ```
 *
 * To use the parser with a user-provided lexer:
 *
 * ```ts
 * function* parse(source: string, lexer: Lexer) {
 *   const parser = new Parser()
 *   for (const lexeme of lexer.lex(source))
 *     yield* parser.next(lexeme)
 *   yield* parser.end()
 * }
 *
 * const src: string = ...
 * const lexer = new Lexer()
 * for (const token of parse(src, lexer)) {
 *   // token: Token
 * }
 * ```
 */
class Parser {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(onNewLine) {
        /** If true, space and sequence indicators count as indentation */
        this.atNewLine = true;
        /** If true, next token is a scalar value */
        this.atScalar = false;
        /** Current indentation level */
        this.indent = 0;
        /** Current offset since the start of parsing */
        this.offset = 0;
        /** On the same line with a block map key */
        this.onKeyLine = false;
        /** Top indicates the node that's currently being built */
        this.stack = [];
        /** The source of the current token, set in parse() */
        this.source = '';
        /** The type of the current token, set in parse() */
        this.type = '';
        // Must be defined after `next()`
        this.lexer = new Lexer();
        this.onNewLine = onNewLine;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
            this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
            yield* this.next(lexeme);
        if (!incomplete)
            yield* this.end();
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(source) {
        this.source = source;
        if (this.atScalar) {
            this.atScalar = false;
            yield* this.step();
            this.offset += source.length;
            return;
        }
        const type = tokenType(source);
        if (!type) {
            const message = `Not a YAML token: ${source}`;
            yield* this.pop({ type: 'error', offset: this.offset, message, source });
            this.offset += source.length;
        }
        else if (type === 'scalar') {
            this.atNewLine = false;
            this.atScalar = true;
            this.type = 'scalar';
        }
        else {
            this.type = type;
            yield* this.step();
            switch (type) {
                case 'newline':
                    this.atNewLine = true;
                    this.indent = 0;
                    if (this.onNewLine)
                        this.onNewLine(this.offset + source.length);
                    break;
                case 'space':
                    if (this.atNewLine && source[0] === ' ')
                        this.indent += source.length;
                    break;
                case 'explicit-key-ind':
                case 'map-value-ind':
                case 'seq-item-ind':
                    if (this.atNewLine)
                        this.indent += source.length;
                    break;
                case 'doc-mode':
                case 'flow-error-end':
                    return;
                default:
                    this.atNewLine = false;
            }
            this.offset += source.length;
        }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
        while (this.stack.length > 0)
            yield* this.pop();
    }
    get sourceToken() {
        const st = {
            type: this.type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
        return st;
    }
    *step() {
        const top = this.peek(1);
        if (this.type === 'doc-end' && (!top || top.type !== 'doc-end')) {
            while (this.stack.length > 0)
                yield* this.pop();
            this.stack.push({
                type: 'doc-end',
                offset: this.offset,
                source: this.source
            });
            return;
        }
        if (!top)
            return yield* this.stream();
        switch (top.type) {
            case 'document':
                return yield* this.document(top);
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return yield* this.scalar(top);
            case 'block-scalar':
                return yield* this.blockScalar(top);
            case 'block-map':
                return yield* this.blockMap(top);
            case 'block-seq':
                return yield* this.blockSequence(top);
            case 'flow-collection':
                return yield* this.flowCollection(top);
            case 'doc-end':
                return yield* this.documentEnd(top);
        }
        /* istanbul ignore next should not happen */
        yield* this.pop();
    }
    peek(n) {
        return this.stack[this.stack.length - n];
    }
    *pop(error) {
        const token = error ?? this.stack.pop();
        /* istanbul ignore if should not happen */
        if (!token) {
            const message = 'Tried to pop an empty stack';
            yield { type: 'error', offset: this.offset, source: '', message };
        }
        else if (this.stack.length === 0) {
            yield token;
        }
        else {
            const top = this.peek(1);
            if (token.type === 'block-scalar') {
                // Block scalars use their parent rather than header indent
                token.indent = 'indent' in top ? top.indent : 0;
            }
            else if (token.type === 'flow-collection' && top.type === 'document') {
                // Ignore all indent for top-level flow collections
                token.indent = 0;
            }
            if (token.type === 'flow-collection')
                fixFlowSeqItems(token);
            switch (top.type) {
                case 'document':
                    top.value = token;
                    break;
                case 'block-scalar':
                    top.props.push(token); // error
                    break;
                case 'block-map': {
                    const it = top.items[top.items.length - 1];
                    if (it.value) {
                        top.items.push({ start: [], key: token, sep: [] });
                        this.onKeyLine = true;
                        return;
                    }
                    else if (it.sep) {
                        it.value = token;
                    }
                    else {
                        Object.assign(it, { key: token, sep: [] });
                        this.onKeyLine = !includesToken(it.start, 'explicit-key-ind');
                        return;
                    }
                    break;
                }
                case 'block-seq': {
                    const it = top.items[top.items.length - 1];
                    if (it.value)
                        top.items.push({ start: [], value: token });
                    else
                        it.value = token;
                    break;
                }
                case 'flow-collection': {
                    const it = top.items[top.items.length - 1];
                    if (!it || it.value)
                        top.items.push({ start: [], key: token, sep: [] });
                    else if (it.sep)
                        it.value = token;
                    else
                        Object.assign(it, { key: token, sep: [] });
                    return;
                }
                /* istanbul ignore next should not happen */
                default:
                    yield* this.pop();
                    yield* this.pop(token);
            }
            if ((top.type === 'document' ||
                top.type === 'block-map' ||
                top.type === 'block-seq') &&
                (token.type === 'block-map' || token.type === 'block-seq')) {
                const last = token.items[token.items.length - 1];
                if (last &&
                    !last.sep &&
                    !last.value &&
                    last.start.length > 0 &&
                    findNonEmptyIndex(last.start) === -1 &&
                    (token.indent === 0 ||
                        last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
                    if (top.type === 'document')
                        top.end = last.start;
                    else
                        top.items.push({ start: last.start });
                    token.items.splice(-1, 1);
                }
            }
        }
    }
    *stream() {
        switch (this.type) {
            case 'directive-line':
                yield { type: 'directive', offset: this.offset, source: this.source };
                return;
            case 'byte-order-mark':
            case 'space':
            case 'comment':
            case 'newline':
                yield this.sourceToken;
                return;
            case 'doc-mode':
            case 'doc-start': {
                const doc = {
                    type: 'document',
                    offset: this.offset,
                    start: []
                };
                if (this.type === 'doc-start')
                    doc.start.push(this.sourceToken);
                this.stack.push(doc);
                return;
            }
        }
        yield {
            type: 'error',
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML stream`,
            source: this.source
        };
    }
    *document(doc) {
        if (doc.value)
            return yield* this.lineEnd(doc);
        switch (this.type) {
            case 'doc-start': {
                if (findNonEmptyIndex(doc.start) !== -1) {
                    yield* this.pop();
                    yield* this.step();
                }
                else
                    doc.start.push(this.sourceToken);
                return;
            }
            case 'anchor':
            case 'tag':
            case 'space':
            case 'comment':
            case 'newline':
                doc.start.push(this.sourceToken);
                return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
            this.stack.push(bv);
        else {
            yield {
                type: 'error',
                offset: this.offset,
                message: `Unexpected ${this.type} token in YAML document`,
                source: this.source
            };
        }
    }
    *scalar(scalar) {
        if (this.type === 'map-value-ind') {
            const prev = getPrevProps(this.peek(2));
            const start = getFirstKeyStartProps(prev);
            let sep;
            if (scalar.end) {
                sep = scalar.end;
                sep.push(this.sourceToken);
                delete scalar.end;
            }
            else
                sep = [this.sourceToken];
            const map = {
                type: 'block-map',
                offset: scalar.offset,
                indent: scalar.indent,
                items: [{ start, key: scalar, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
        }
        else
            yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
        switch (this.type) {
            case 'space':
            case 'comment':
            case 'newline':
                scalar.props.push(this.sourceToken);
                return;
            case 'scalar':
                scalar.source = this.source;
                // block-scalar source includes trailing newline
                this.atNewLine = true;
                this.indent = 0;
                if (this.onNewLine) {
                    let nl = this.source.indexOf('\n') + 1;
                    while (nl !== 0) {
                        this.onNewLine(this.offset + nl);
                        nl = this.source.indexOf('\n', nl) + 1;
                    }
                }
                yield* this.pop();
                break;
            /* istanbul ignore next should not happen */
            default:
                yield* this.pop();
                yield* this.step();
        }
    }
    *blockMap(map) {
        const it = map.items[map.items.length - 1];
        // it.sep is true-ish if pair already has key or : separator
        switch (this.type) {
            case 'newline':
                this.onKeyLine = false;
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    it.start.push(this.sourceToken);
                }
                return;
            case 'space':
            case 'comment':
                if (it.value) {
                    map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    if (this.atIndentedComment(it.start, map.indent)) {
                        const prev = map.items[map.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            map.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
        }
        if (this.indent >= map.indent) {
            const atNextItem = !this.onKeyLine && this.indent === map.indent && it.sep;
            // For empty nodes, assign newline-separated not indented empty tokens to following node
            let start = [];
            if (atNextItem && it.sep && !it.value) {
                const nl = [];
                for (let i = 0; i < it.sep.length; ++i) {
                    const st = it.sep[i];
                    switch (st.type) {
                        case 'newline':
                            nl.push(i);
                            break;
                        case 'space':
                            break;
                        case 'comment':
                            if (st.indent > map.indent)
                                nl.length = 0;
                            break;
                        default:
                            nl.length = 0;
                    }
                }
                if (nl.length >= 2)
                    start = it.sep.splice(nl[1]);
            }
            switch (this.type) {
                case 'anchor':
                case 'tag':
                    if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'explicit-key-ind':
                    if (!it.sep && !includesToken(it.start, 'explicit-key-ind')) {
                        it.start.push(this.sourceToken);
                    }
                    else if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start });
                    }
                    else {
                        this.stack.push({
                            type: 'block-map',
                            offset: this.offset,
                            indent: this.indent,
                            items: [{ start: [this.sourceToken] }]
                        });
                    }
                    this.onKeyLine = true;
                    return;
                case 'map-value-ind':
                    if (includesToken(it.start, 'explicit-key-ind')) {
                        if (!it.sep) {
                            if (includesToken(it.start, 'newline')) {
                                Object.assign(it, { key: null, sep: [this.sourceToken] });
                            }
                            else {
                                const start = getFirstKeyStartProps(it.start);
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key: null, sep: [this.sourceToken] }]
                                });
                            }
                        }
                        else if (it.value) {
                            map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else if (isFlowToken(it.key) &&
                            !includesToken(it.sep, 'newline')) {
                            const start = getFirstKeyStartProps(it.start);
                            const key = it.key;
                            const sep = it.sep;
                            sep.push(this.sourceToken);
                            // @ts-expect-error type guard is wrong here
                            delete it.key, delete it.sep;
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key, sep }]
                            });
                        }
                        else if (start.length > 0) {
                            // Not actually at next item
                            it.sep = it.sep.concat(start, this.sourceToken);
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    else {
                        if (!it.sep) {
                            Object.assign(it, { key: null, sep: [this.sourceToken] });
                        }
                        else if (it.value || atNextItem) {
                            map.items.push({ start, key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start: [], key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    this.onKeyLine = true;
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (atNextItem || it.value) {
                        map.items.push({ start, key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        this.stack.push(fs);
                    }
                    else {
                        Object.assign(it, { key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    return;
                }
                default: {
                    const bv = this.startBlockValue(map);
                    if (bv) {
                        if (atNextItem &&
                            bv.type !== 'block-seq' &&
                            includesToken(it.start, 'explicit-key-ind')) {
                            map.items.push({ start });
                        }
                        this.stack.push(bv);
                        return;
                    }
                }
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
            case 'newline':
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        seq.items.push({ start: [this.sourceToken] });
                }
                else
                    it.start.push(this.sourceToken);
                return;
            case 'space':
            case 'comment':
                if (it.value)
                    seq.items.push({ start: [this.sourceToken] });
                else {
                    if (this.atIndentedComment(it.start, seq.indent)) {
                        const prev = seq.items[seq.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            seq.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
            case 'anchor':
            case 'tag':
                if (it.value || this.indent <= seq.indent)
                    break;
                it.start.push(this.sourceToken);
                return;
            case 'seq-item-ind':
                if (this.indent !== seq.indent)
                    break;
                if (it.value || includesToken(it.start, 'seq-item-ind'))
                    seq.items.push({ start: [this.sourceToken] });
                else
                    it.start.push(this.sourceToken);
                return;
        }
        if (this.indent > seq.indent) {
            const bv = this.startBlockValue(seq);
            if (bv) {
                this.stack.push(bv);
                return;
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === 'flow-error-end') {
            let top;
            do {
                yield* this.pop();
                top = this.peek(1);
            } while (top && top.type === 'flow-collection');
        }
        else if (fc.end.length === 0) {
            switch (this.type) {
                case 'comma':
                case 'explicit-key-ind':
                    if (!it || it.sep)
                        fc.items.push({ start: [this.sourceToken] });
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'map-value-ind':
                    if (!it || it.value)
                        fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        Object.assign(it, { key: null, sep: [this.sourceToken] });
                    return;
                case 'space':
                case 'comment':
                case 'newline':
                case 'anchor':
                case 'tag':
                    if (!it || it.value)
                        fc.items.push({ start: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (!it || it.value)
                        fc.items.push({ start: [], key: fs, sep: [] });
                    else if (it.sep)
                        this.stack.push(fs);
                    else
                        Object.assign(it, { key: fs, sep: [] });
                    return;
                }
                case 'flow-map-end':
                case 'flow-seq-end':
                    fc.end.push(this.sourceToken);
                    return;
            }
            const bv = this.startBlockValue(fc);
            /* istanbul ignore else should not happen */
            if (bv)
                this.stack.push(bv);
            else {
                yield* this.pop();
                yield* this.step();
            }
        }
        else {
            const parent = this.peek(2);
            if (parent.type === 'block-map' &&
                ((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
                    (this.type === 'newline' &&
                        !parent.items[parent.items.length - 1].sep))) {
                yield* this.pop();
                yield* this.step();
            }
            else if (this.type === 'map-value-ind' &&
                parent.type !== 'flow-collection') {
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                fixFlowSeqItems(fc);
                const sep = fc.end.splice(1, fc.end.length);
                sep.push(this.sourceToken);
                const map = {
                    type: 'block-map',
                    offset: fc.offset,
                    indent: fc.indent,
                    items: [{ start, key: fc, sep }]
                };
                this.onKeyLine = true;
                this.stack[this.stack.length - 1] = map;
            }
            else {
                yield* this.lineEnd(fc);
            }
        }
    }
    flowScalar(type) {
        if (this.onNewLine) {
            let nl = this.source.indexOf('\n') + 1;
            while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf('\n', nl) + 1;
            }
        }
        return {
            type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
    }
    startBlockValue(parent) {
        switch (this.type) {
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return this.flowScalar(this.type);
            case 'block-scalar-header':
                return {
                    type: 'block-scalar',
                    offset: this.offset,
                    indent: this.indent,
                    props: [this.sourceToken],
                    source: ''
                };
            case 'flow-map-start':
            case 'flow-seq-start':
                return {
                    type: 'flow-collection',
                    offset: this.offset,
                    indent: this.indent,
                    start: this.sourceToken,
                    items: [],
                    end: []
                };
            case 'seq-item-ind':
                return {
                    type: 'block-seq',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [this.sourceToken] }]
                };
            case 'explicit-key-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                start.push(this.sourceToken);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start }]
                };
            }
            case 'map-value-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                };
            }
        }
        return null;
    }
    atIndentedComment(start, indent) {
        if (this.type !== 'comment')
            return false;
        if (this.indent <= indent)
            return false;
        return start.every(st => st.type === 'newline' || st.type === 'space');
    }
    *documentEnd(docEnd) {
        if (this.type !== 'doc-mode') {
            if (docEnd.end)
                docEnd.end.push(this.sourceToken);
            else
                docEnd.end = [this.sourceToken];
            if (this.type === 'newline')
                yield* this.pop();
        }
    }
    *lineEnd(token) {
        switch (this.type) {
            case 'comma':
            case 'doc-start':
            case 'doc-end':
            case 'flow-seq-end':
            case 'flow-map-end':
            case 'map-value-ind':
                yield* this.pop();
                yield* this.step();
                break;
            case 'newline':
                this.onKeyLine = false;
            // fallthrough
            case 'space':
            case 'comment':
            default:
                // all other values are errors
                if (token.end)
                    token.end.push(this.sourceToken);
                else
                    token.end = [this.sourceToken];
                if (this.type === 'newline')
                    yield* this.pop();
        }
    }
}

function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter = options.lineCounter || (prettyErrors && new LineCounter()) || null;
    return { lineCounter, prettyErrors };
}
/** Parse an input string into a single YAML.Document */
function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new Parser(lineCounter?.addNewLine);
    const composer = new Composer(options);
    // `doc` is always set by compose.end(true) at the very latest
    let doc = null;
    for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
        if (!doc)
            doc = _doc;
        else if (doc.options.logLevel !== 'silent') {
            doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
            break;
        }
    }
    if (prettyErrors && lineCounter) {
        doc.errors.forEach(prettifyError(source, lineCounter));
        doc.warnings.forEach(prettifyError(source, lineCounter));
    }
    return doc;
}
function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === 'function') {
        _reviver = reviver;
    }
    else if (options === undefined && reviver && typeof reviver === 'object') {
        options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
        return null;
    doc.warnings.forEach(warning => warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
        if (doc.options.logLevel !== 'silent')
            throw doc.errors[0];
        else
            doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
}

let NailyConfiguration = class NailyConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getConfigure(_builder, isOptional) {
        if (!existsSync(join(process.cwd(), "naily.yml")) && !isOptional) {
            throw new Error(`Cannot find naily.yml`);
        }
        const file = readFileSync(join(process.cwd(), "naily.yml")).toString();
        return parse(file);
    }
};
NailyConfiguration = __decorate([
    Injectable()
], NailyConfiguration);

function Value(jexl = "", configureOrOptional, configure = new NailyConfiguration()) {
    return NailyDecoratorFactory.createPropertyDecorator({
        after(target, propertyKey) {
            target[propertyKey] = NailyBeanRegistry.jexl.evalSync(jexl, (() => {
                if (!configureOrOptional && typeof configureOrOptional === "object") {
                    return configureOrOptional.getConfigure(NailyBeanRegistry.jexl, false);
                }
                else {
                    if (!configure)
                        configure = new NailyConfiguration();
                    return configure.getConfigure(NailyBeanRegistry.jexl, typeof configureOrOptional === "boolean" ? configureOrOptional : false);
                }
            })());
        },
    });
}

let TestService2 = class TestService2 {
};
__decorate([
    Autowired(),
    __metadata("design:type", T)
], TestService2.prototype, "testService", void 0);
TestService2 = __decorate([
    Injectable()
], TestService2);
let T = class T {
};
__decorate([
    Autowired(),
    __metadata("design:type", TestService)
], T.prototype, "testService", void 0);
__decorate([
    Autowired(),
    __metadata("design:type", TestService2)
], T.prototype, "testService2", void 0);
__decorate([
    Value("test"),
    __metadata("design:type", String)
], T.prototype, "test", void 0);
T = __decorate([
    Injectable()
], T);
console.log(new NailyBeanFactory(T).createInstance().testService2);

export { T, TestService2 };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29yZS9saWIvZXNtL2NvbW1vbi9jbGFzc2VzL2RlY29yYXRvci5mYWN0b3J5LmpzIiwiLi4vLi4vLi4vY29yZS9saWIvZXNtL2NvbW1vbi9kZWNvcmF0b3JzL2luamVjdGFibGUuZGVjb3JhdG9yLmpzIiwiLi4vLi4vLi4vY29yZS9saWIvZXNtL2NvbW1vbi9kZWNvcmF0b3JzL2luamVjdC5kZWNvcmF0b3IuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvaWRlbnRpdHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvdmlzaXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2FuY2hvcnMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2FwcGx5UmV2aXZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy90b0pTLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL05vZGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvQWxpYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9jcmVhdGVOb2RlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL0NvbGxlY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L2ZvbGRGbG93TGluZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2xvZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9QYWlyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL1lBTUxNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9tYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvWUFNTFNlcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL3N0cmluZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL251bGwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2Zsb2F0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9zY2hlbWEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2pzb24vc2NoZW1hLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9iaW5hcnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3BhaXJzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9vbWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9mbG9hdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvaW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3RpbWVzdGFtcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvc2NoZW1hLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS90YWdzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9TY2hlbWEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9lcnJvcnMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLXByb3BzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvdXRpbC1jb250YWlucy1uZXdsaW5lLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtbWFwLWluY2x1ZGVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNlcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZW5kLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLWNvbGxlY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLXNjYWxhci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtZW1wdHktc2NhbGFyLXBvc2l0aW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZS1ub2RlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZS1kb2MuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3Nlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvbGV4ZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0veWFtbEAyLjMuNC9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3lhbWxAMi4zLjQvbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL3BhcnNlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95YW1sQDIuMy40L25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wdWJsaWMtYXBpLmpzIiwiLi4vLi4vLi4vY29yZS9saWIvZXNtL2JhY2tlbmQvdmVuZG9ycy9uYWlseS5jb25maWd1cmF0aW9uLmpzIiwiLi4vLi4vLi4vY29yZS9saWIvZXNtL2JhY2tlbmQvZGVjb3JhdG9ycy92YWx1ZS5kZWNvcmF0b3IuanMiLCIuLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCZWFuIH0gZnJvbSAnLi4vZGVjb3JhdG9ycyc7XG5cbmNsYXNzIE5haWx5RGVjb3JhdG9yRmFjdG9yeSB7XG4gICAgc3RhdGljIGFwcGx5RGVjb3JhdG9ycyguLi5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiAodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiAhZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgICAgICAgICBkZWNvcmF0b3IodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhdGljIGFwcGx5Q2xhc3NEZWNvcmF0b3JzKC4uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuICh0YXJnZXQpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIGRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3IodGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhdGljIGFwcGx5TWV0aG9kRGVjb3JhdG9ycyguLi5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiAodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhdGljIGFwcGx5UHJvcGVydHlEZWNvcmF0b3JzKC4uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuICh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBkZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGF0aWMgYXBwbHlQYXJhbWV0ZXJEZWNvcmF0b3JzKC4uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuICh0YXJnZXQsIHByb3BlcnR5S2V5LCBwYXJhbWV0ZXJJbmRleCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5S2V5LCBwYXJhbWV0ZXJJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0eURlY29yYXRvcihmYWN0b3J5ID0ge30pIHtcbiAgICAgICAgcmV0dXJuICh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZmFjdG9yeS5iZWZvcmUgPyBmYWN0b3J5LmJlZm9yZSh0YXJnZXQsIHByb3BlcnR5S2V5KSA6IHt9O1xuICAgICAgICAgICAgQmVhbihvcHRpb25zKSh0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGZhY3RvcnkuYWZ0ZXIgPyBmYWN0b3J5LmFmdGVyKHRhcmdldCwgcHJvcGVydHlLZXksIG9wdGlvbnMpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlQ2xhc3NEZWNvcmF0b3IoZmFjdG9yeSA9IHt9KSB7XG4gICAgICAgIHJldHVybiAodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZmFjdG9yeS5iZWZvcmUgPyBmYWN0b3J5LmJlZm9yZSh0YXJnZXQpIDoge307XG4gICAgICAgICAgICBCZWFuKG9wdGlvbnMpKHRhcmdldCk7XG4gICAgICAgICAgICBmYWN0b3J5LmFmdGVyID8gZmFjdG9yeS5hZnRlcih0YXJnZXQsIG9wdGlvbnMpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlTWV0aG9kRGVjb3JhdG9yKGZhY3RvcnkgPSB7fSkge1xuICAgICAgICByZXR1cm4gKHRhcmdldCwgcHJvcGVydHlLZXksIGRlc2NyaXB0b3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBmYWN0b3J5LmJlZm9yZSA/IGZhY3RvcnkuYmVmb3JlKHRhcmdldCwgcHJvcGVydHlLZXksIGRlc2NyaXB0b3IpIDoge307XG4gICAgICAgICAgICBCZWFuKG9wdGlvbnMpKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgZmFjdG9yeS5hZnRlciA/IGZhY3RvcnkuYWZ0ZXIodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvciwgb3B0aW9ucykgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5leHBvcnQgeyBOYWlseURlY29yYXRvckZhY3RvcnkgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWkdWamIzSmhkRzl5TG1aaFkzUnZjbmt1YW5NaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUx5NHVMeTR1TDNOeVl5OWpiMjF0YjI0dlkyeGhjM05sY3k5a1pXTnZjbUYwYjNJdVptRmpkRzl5ZVM1MGN5SmRMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdleUJDWldGdUlIMGdabkp2YlNCY0lpNHVMMlJsWTI5eVlYUnZjbk5jSWp0Y2JtbHRjRzl5ZENCN0lGUjVjR1VnZlNCbWNtOXRJRndpTGk0dmRIbHdhVzVuYzF3aU8xeHVYRzVsZUhCdmNuUWdibUZ0WlhOd1lXTmxJRTVoYVd4NVJHVmpiM0poZEc5eVJtRmpkRzl5ZVNCN1hHNGdJR1Y0Y0c5eWRDQnBiblJsY21aaFkyVWdVSEp2Y0dWeWRIbEVaV052Y21GMGIzSkdZV04wYjNKNUlIdGNiaUFnSUNCaVpXWnZjbVUvS0hSaGNtZGxkRG9nVDJKcVpXTjBMQ0J3Y205d1pYSjBlVXRsZVRvZ2MzUnlhVzVuSUh3Z2MzbHRZbTlzS1RvZ1VHRnlkR2xoYkR4T1NVOURMa0psWVc1TlpYUmhaR0YwWVQ0N1hHNGdJQ0FnWVdaMFpYSS9LSFJoY21kbGREb2dUMkpxWldOMExDQndjbTl3WlhKMGVVdGxlVG9nYzNSeWFXNW5JSHdnYzNsdFltOXNMQ0J2Y0hScGIyNXpPaUJRWVhKMGFXRnNQRTVKVDBNdVFtVmhiazFsZEdGa1lYUmhQaWs2SUhadmFXUTdYRzRnSUgxY2JseHVJQ0JsZUhCdmNuUWdhVzUwWlhKbVlXTmxJRU5zWVhOelJHVmpiM0poZEc5eVJtRmpkRzl5ZVNCN1hHNGdJQ0FnWW1WbWIzSmxQenhKYm5OMFlXNWpaVDRvZEdGeVoyVjBPaUJVZVhCbFBFbHVjM1JoYm1ObFBpazZJRkJoY25ScFlXdzhUa2xQUXk1Q1pXRnVUV1YwWVdSaGRHRStPMXh1SUNBZ0lHRm1kR1Z5UHp4SmJuTjBZVzVqWlQ0b2RHRnlaMlYwT2lCVWVYQmxQRWx1YzNSaGJtTmxQaXdnYjNCMGFXOXVjem9nVUdGeWRHbGhiRHhPU1U5RExrSmxZVzVOWlhSaFpHRjBZVDRwT2lCMmIybGtPMXh1SUNCOVhHNWNiaUFnWlhod2IzSjBJR2x1ZEdWeVptRmpaU0JOWlhSb2IyUkVaV052Y21GMGIzSkdZV04wYjNKNUlIdGNiaUFnSUNCaVpXWnZjbVUvS0hSaGNtZGxkRG9nVDJKcVpXTjBMQ0J3Y205d1pYSjBlVXRsZVRvZ2MzUnlhVzVuSUh3Z2MzbHRZbTlzTENCa1pYTmpjbWx3ZEc5eU9pQlVlWEJsWkZCeWIzQmxjblI1UkdWelkzSnBjSFJ2Y2p3b0xpNHVZWEpuY3pvZ1lXNTVXMTBwSUQwK0lHRnVlVDRwT2lCUVlYSjBhV0ZzUEU1SlQwTXVRbVZoYmsxbGRHRmtZWFJoUGp0Y2JpQWdJQ0JoWm5SbGNqOG9YRzRnSUNBZ0lDQjBZWEpuWlhRNklFOWlhbVZqZEN4Y2JpQWdJQ0FnSUhCeWIzQmxjblI1UzJWNU9pQnpkSEpwYm1jZ2ZDQnplVzFpYjJ3c1hHNGdJQ0FnSUNCa1pYTmpjbWx3ZEc5eU9pQlVlWEJsWkZCeWIzQmxjblI1UkdWelkzSnBjSFJ2Y2p3b0xpNHVZWEpuY3pvZ1lXNTVXMTBwSUQwK0lHRnVlVDRzWEc0Z0lDQWdJQ0J2Y0hScGIyNXpPaUJRWVhKMGFXRnNQRTVKVDBNdVFtVmhiazFsZEdGa1lYUmhQaXhjYmlBZ0lDQXBPaUIyYjJsa08xeHVJQ0I5WEc1OVhHNWNibVY0Y0c5eWRDQmpiR0Z6Y3lCT1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua2dlMXh1SUNCd2RXSnNhV01nYzNSaGRHbGpJR0Z3Y0d4NVJHVmpiM0poZEc5eWN5Z3VMaTVrWldOdmNtRjBiM0p6T2lCQmNuSmhlVHhEYkdGemMwUmxZMjl5WVhSdmNpQjhJRTFsZEdodlpFUmxZMjl5WVhSdmNpQjhJRkJ5YjNCbGNuUjVSR1ZqYjNKaGRHOXlQaWtnZTF4dUlDQWdJSEpsZEhWeWJpQThWRVoxYm1OMGFXOXVJR1Y0ZEdWdVpITWdSblZ1WTNScGIyNHNJRmsrS0hSaGNtZGxkRG9nVkVaMWJtTjBhVzl1SUh3Z2IySnFaV04wTENCd2NtOXdaWEowZVV0bGVUODZJSE4wY21sdVp5QjhJSE41YldKdmJDd2daR1Z6WTNKcGNIUnZjajg2SUZSNWNHVmtVSEp2Y0dWeWRIbEVaWE5qY21sd2RHOXlQRmsrS1NBOVBpQjdYRzRnSUNBZ0lDQm1iM0lnS0dOdmJuTjBJR1JsWTI5eVlYUnZjaUJ2WmlCa1pXTnZjbUYwYjNKektTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMFlYSm5aWFFnYVc1emRHRnVZMlZ2WmlCR2RXNWpkR2x2YmlBbUppQWhaR1Z6WTNKcGNIUnZjaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDaGtaV052Y21GMGIzSWdZWE1nUTJ4aGMzTkVaV052Y21GMGIzSXBLSFJoY21kbGRDazdYRzRnSUNBZ0lDQWdJQ0FnWTI5dWRHbHVkV1U3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0tHUmxZMjl5WVhSdmNpQmhjeUJOWlhSb2IyUkVaV052Y21GMGIzSWdmQ0JRY205d1pYSjBlVVJsWTI5eVlYUnZjaWtvZEdGeVoyVjBMQ0J3Y205d1pYSjBlVXRsZVN3Z1pHVnpZM0pwY0hSdmNpazdYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZUdGNiaUFnZlZ4dVhHNGdJSEIxWW14cFl5QnpkR0YwYVdNZ1lYQndiSGxEYkdGemMwUmxZMjl5WVhSdmNuTW9MaTR1WkdWamIzSmhkRzl5Y3pvZ1FYSnlZWGs4UTJ4aGMzTkVaV052Y21GMGIzSStLVG9nUTJ4aGMzTkVaV052Y21GMGIzSWdlMXh1SUNBZ0lISmxkSFZ5YmlBOFZFWjFibU4wYVc5dUlHVjRkR1Z1WkhNZ1JuVnVZM1JwYjI0K0tIUmhjbWRsZERvZ1ZFWjFibU4wYVc5dUtTQTlQaUI3WEc0Z0lDQWdJQ0JtYjNJZ0tHTnZibk4wSUdSbFkyOXlZWFJ2Y2lCdlppQmtaV052Y21GMGIzSnpLU0I3WEc0Z0lDQWdJQ0FnSUNoa1pXTnZjbUYwYjNJZ1lYTWdRMnhoYzNORVpXTnZjbUYwYjNJcEtIUmhjbWRsZENrN1hHNGdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JpQWdmVnh1WEc0Z0lIQjFZbXhwWXlCemRHRjBhV01nWVhCd2JIbE5aWFJvYjJSRVpXTnZjbUYwYjNKektDNHVMbVJsWTI5eVlYUnZjbk02SUVGeWNtRjVQRTFsZEdodlpFUmxZMjl5WVhSdmNqNHBPaUJOWlhSb2IyUkVaV052Y21GMGIzSWdlMXh1SUNBZ0lISmxkSFZ5YmlBOFZFWjFibU4wYVc5dUlHVjRkR1Z1WkhNZ1JuVnVZM1JwYjI0K0tIUmhjbWRsZERvZ1ZFWjFibU4wYVc5dUxDQndjbTl3WlhKMGVVdGxlVG9nYzNSeWFXNW5JSHdnYzNsdFltOXNMQ0JrWlhOamNtbHdkRzl5T2lCVWVYQmxaRkJ5YjNCbGNuUjVSR1Z6WTNKcGNIUnZjanhoYm5rK0tTQTlQaUI3WEc0Z0lDQWdJQ0JtYjNJZ0tHTnZibk4wSUdSbFkyOXlZWFJ2Y2lCdlppQmtaV052Y21GMGIzSnpLU0I3WEc0Z0lDQWdJQ0FnSUNoa1pXTnZjbUYwYjNJZ1lYTWdUV1YwYUc5a1JHVmpiM0poZEc5eUtTaDBZWEpuWlhRc0lIQnliM0JsY25SNVMyVjVMQ0JrWlhOamNtbHdkRzl5S1R0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0I5TzF4dUlDQjlYRzVjYmlBZ2NIVmliR2xqSUhOMFlYUnBZeUJoY0hCc2VWQnliM0JsY25SNVJHVmpiM0poZEc5eWN5Z3VMaTVrWldOdmNtRjBiM0p6T2lCQmNuSmhlVHhRY205d1pYSjBlVVJsWTI5eVlYUnZjajRwT2lCUWNtOXdaWEowZVVSbFkyOXlZWFJ2Y2lCN1hHNGdJQ0FnY21WMGRYSnVJRHhVUm5WdVkzUnBiMjRnWlhoMFpXNWtjeUJHZFc1amRHbHZiajRvZEdGeVoyVjBPaUJVUm5WdVkzUnBiMjRzSUhCeWIzQmxjblI1UzJWNU9pQnpkSEpwYm1jZ2ZDQnplVzFpYjJ3cElEMCtJSHRjYmlBZ0lDQWdJR1p2Y2lBb1kyOXVjM1FnWkdWamIzSmhkRzl5SUc5bUlHUmxZMjl5WVhSdmNuTXBJSHRjYmlBZ0lDQWdJQ0FnS0dSbFkyOXlZWFJ2Y2lCaGN5QlFjbTl3WlhKMGVVUmxZMjl5WVhSdmNpa29kR0Z5WjJWMExDQndjbTl3WlhKMGVVdGxlU2s3WEc0Z0lDQWdJQ0I5WEc0Z0lDQWdmVHRjYmlBZ2ZWeHVYRzRnSUhCMVlteHBZeUJ6ZEdGMGFXTWdZWEJ3YkhsUVlYSmhiV1YwWlhKRVpXTnZjbUYwYjNKektDNHVMbVJsWTI5eVlYUnZjbk02SUVGeWNtRjVQRkJoY21GdFpYUmxja1JsWTI5eVlYUnZjajRwT2lCUVlYSmhiV1YwWlhKRVpXTnZjbUYwYjNJZ2UxeHVJQ0FnSUhKbGRIVnliaUE4VkVaMWJtTjBhVzl1SUdWNGRHVnVaSE1nUm5WdVkzUnBiMjQrS0hSaGNtZGxkRG9nVkVaMWJtTjBhVzl1TENCd2NtOXdaWEowZVV0bGVUb2djM1J5YVc1bklId2djM2x0WW05c0xDQndZWEpoYldWMFpYSkpibVJsZURvZ2JuVnRZbVZ5S1NBOVBpQjdYRzRnSUNBZ0lDQm1iM0lnS0dOdmJuTjBJR1JsWTI5eVlYUnZjaUJ2WmlCa1pXTnZjbUYwYjNKektTQjdYRzRnSUNBZ0lDQWdJQ2hrWldOdmNtRjBiM0lnWVhNZ1VHRnlZVzFsZEdWeVJHVmpiM0poZEc5eUtTaDBZWEpuWlhRc0lIQnliM0JsY25SNVMyVjVMQ0J3WVhKaGJXVjBaWEpKYm1SbGVDazdYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZUdGNiaUFnZlZ4dVhHNGdJSEIxWW14cFl5QnpkR0YwYVdNZ1kzSmxZWFJsVUhKdmNHVnlkSGxFWldOdmNtRjBiM0lvWm1GamRHOXllVDg2SUU1aGFXeDVSR1ZqYjNKaGRHOXlSbUZqZEc5eWVTNVFjbTl3WlhKMGVVUmxZMjl5WVhSdmNrWmhZM1J2Y25rcE9pQlFjbTl3WlhKMGVVUmxZMjl5WVhSdmNqdGNiaUFnY0hWaWJHbGpJSE4wWVhScFl5QmpjbVZoZEdWUWNtOXdaWEowZVVSbFkyOXlZWFJ2Y2lobVlXTjBiM0o1T2lCUVlYSjBhV0ZzUEU1aGFXeDVSR1ZqYjNKaGRHOXlSbUZqZEc5eWVTNVFjbTl3WlhKMGVVUmxZMjl5WVhSdmNrWmhZM1J2Y25rK0lEMGdlMzBwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdLSFJoY21kbGREb2dUMkpxWldOMExDQndjbTl3WlhKMGVVdGxlVG9nYzNSeWFXNW5JSHdnYzNsdFltOXNLU0E5UGlCN1hHNGdJQ0FnSUNCamIyNXpkQ0J2Y0hScGIyNXpJRDBnWm1GamRHOXllUzVpWldadmNtVWdQeUJtWVdOMGIzSjVMbUpsWm05eVpTaDBZWEpuWlhRc0lIQnliM0JsY25SNVMyVjVLU0E2SUh0OU8xeHVJQ0FnSUNBZ1FtVmhiaWh2Y0hScGIyNXpLU2gwWVhKblpYUXNJSEJ5YjNCbGNuUjVTMlY1S1R0Y2JpQWdJQ0FnSUdaaFkzUnZjbmt1WVdaMFpYSWdQeUJtWVdOMGIzSjVMbUZtZEdWeUtIUmhjbWRsZEN3Z2NISnZjR1Z5ZEhsTFpYa3NJRzl3ZEdsdmJuTXBJRG9nZFc1a1pXWnBibVZrTzF4dUlDQWdJSDA3WEc0Z0lIMWNibHh1SUNCd2RXSnNhV01nYzNSaGRHbGpJR055WldGMFpVTnNZWE56UkdWamIzSmhkRzl5S0daaFkzUnZjbmsvT2lCT1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua3VRMnhoYzNORVpXTnZjbUYwYjNKR1lXTjBiM0o1S1RvZ1EyeGhjM05FWldOdmNtRjBiM0k3WEc0Z0lIQjFZbXhwWXlCemRHRjBhV01nWTNKbFlYUmxRMnhoYzNORVpXTnZjbUYwYjNJb1ptRmpkRzl5ZVRvZ1VHRnlkR2xoYkR4T1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua3VRMnhoYzNORVpXTnZjbUYwYjNKR1lXTjBiM0o1UGlBOUlIdDlLU0I3WEc0Z0lDQWdjbVYwZFhKdUlDaDBZWEpuWlhRNklGUjVjR1VwSUQwK0lIdGNiaUFnSUNBZ0lHTnZibk4wSUc5d2RHbHZibk1nUFNCbVlXTjBiM0o1TG1KbFptOXlaU0EvSUdaaFkzUnZjbmt1WW1WbWIzSmxLSFJoY21kbGRDa2dPaUI3ZlR0Y2JpQWdJQ0FnSUVKbFlXNG9iM0IwYVc5dWN5a29kR0Z5WjJWMEtUdGNiaUFnSUNBZ0lHWmhZM1J2Y25rdVlXWjBaWElnUHlCbVlXTjBiM0o1TG1GbWRHVnlLSFJoY21kbGRDd2diM0IwYVc5dWN5a2dPaUIxYm1SbFptbHVaV1E3WEc0Z0lDQWdmVHRjYmlBZ2ZWeHVYRzRnSUhCMVlteHBZeUJ6ZEdGMGFXTWdZM0psWVhSbFRXVjBhRzlrUkdWamIzSmhkRzl5S0daaFkzUnZjbmsvT2lCT1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua3VUV1YwYUc5a1JHVmpiM0poZEc5eVJtRmpkRzl5ZVNrNklFMWxkR2h2WkVSbFkyOXlZWFJ2Y2p0Y2JpQWdjSFZpYkdsaklITjBZWFJwWXlCamNtVmhkR1ZOWlhSb2IyUkVaV052Y21GMGIzSW9abUZqZEc5eWVUb2dVR0Z5ZEdsaGJEeE9ZV2xzZVVSbFkyOXlZWFJ2Y2taaFkzUnZjbmt1VFdWMGFHOWtSR1ZqYjNKaGRHOXlSbUZqZEc5eWVUNGdQU0I3ZlNrZ2UxeHVJQ0FnSUhKbGRIVnliaUFvZEdGeVoyVjBPaUJQWW1wbFkzUXNJSEJ5YjNCbGNuUjVTMlY1T2lCemRISnBibWNnZkNCemVXMWliMndzSUdSbGMyTnlhWEIwYjNJNklGUjVjR1ZrVUhKdmNHVnlkSGxFWlhOamNtbHdkRzl5UENndUxpNWhjbWR6T2lCaGJubGJYU2tnUFQ0Z1lXNTVQaWtnUFQ0Z2UxeHVJQ0FnSUNBZ1kyOXVjM1FnYjNCMGFXOXVjeUE5SUdaaFkzUnZjbmt1WW1WbWIzSmxJRDhnWm1GamRHOXllUzVpWldadmNtVW9kR0Z5WjJWMExDQndjbTl3WlhKMGVVdGxlU3dnWkdWelkzSnBjSFJ2Y2lrZ09pQjdmVHRjYmlBZ0lDQWdJRUpsWVc0b2IzQjBhVzl1Y3lrb2RHRnlaMlYwTENCd2NtOXdaWEowZVV0bGVTazdYRzRnSUNBZ0lDQm1ZV04wYjNKNUxtRm1kR1Z5SUQ4Z1ptRmpkRzl5ZVM1aFpuUmxjaWgwWVhKblpYUXNJSEJ5YjNCbGNuUjVTMlY1TENCa1pYTmpjbWx3ZEc5eUxDQnZjSFJwYjI1ektTQTZJSFZ1WkdWbWFXNWxaRHRjYmlBZ0lDQjlPMXh1SUNCOVhHNTlYRzRpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3VFVGNVFtRXNjVUpCUVhGQ0xFTkJRVUU3UVVGRGVrSXNTVUZCUVN4UFFVRlBMR1ZCUVdVc1EwRkJReXhIUVVGSExGVkJRWFZGTEVWQlFVRTdRVUZEZEVjc1VVRkJRU3hQUVVGUExFTkJRV2RETEUxQlFUQkNMRVZCUVVVc1YwRkJOa0lzUlVGQlJTeFZRVUYxUXl4TFFVRkpPMEZCUXpOSkxGbEJRVUVzUzBGQlN5eE5RVUZOTEZOQlFWTXNTVUZCU1N4VlFVRlZMRVZCUVVVN1FVRkRiRU1zWjBKQlFVRXNTVUZCU1N4TlFVRk5MRmxCUVZrc1VVRkJVU3hKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTzI5Q1FVTTFReXhUUVVFMFFpeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMjlDUVVOMFF5eFRRVUZUTzJsQ1FVTldPMEZCUTBFc1owSkJRVUVzVTBGQmFVUXNRMEZCUXl4TlFVRk5MRVZCUVVVc1YwRkJWeXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzJGQlEzSkdPMEZCUTBnc1UwRkJReXhEUVVGRE8wdEJRMGc3UVVGRlRTeEpRVUZCTEU5QlFVOHNiMEpCUVc5Q0xFTkJRVU1zUjBGQlJ5eFZRVUZwUXl4RlFVRkJPMUZCUTNKRkxFOUJRVThzUTBGQk5rSXNUVUZCYVVJc1MwRkJTVHRCUVVOMlJDeFpRVUZCTEV0QlFVc3NUVUZCVFN4VFFVRlRMRWxCUVVrc1ZVRkJWU3hGUVVGRk8yZENRVU5xUXl4VFFVRTBRaXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzJGQlEzWkRPMEZCUTBnc1UwRkJReXhEUVVGRE8wdEJRMGc3UVVGRlRTeEpRVUZCTEU5QlFVOHNjVUpCUVhGQ0xFTkJRVU1zUjBGQlJ5eFZRVUZyUXl4RlFVRkJPMEZCUTNaRkxGRkJRVUVzVDBGQlR5eERRVUUyUWl4TlFVRnBRaXhGUVVGRkxGZEJRVFJDTEVWQlFVVXNWVUZCZDBNc1MwRkJTVHRCUVVNdlNDeFpRVUZCTEV0QlFVc3NUVUZCVFN4VFFVRlRMRWxCUVVrc1ZVRkJWU3hGUVVGRk8wRkJRMnBETEdkQ1FVRkJMRk5CUVRaQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTEZkQlFWY3NSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRoUVVOcVJUdEJRVU5JTEZOQlFVTXNRMEZCUXp0TFFVTklPMEZCUlUwc1NVRkJRU3hQUVVGUExIVkNRVUYxUWl4RFFVRkRMRWRCUVVjc1ZVRkJiME1zUlVGQlFUdEJRVU16UlN4UlFVRkJMRTlCUVU4c1EwRkJOa0lzVFVGQmFVSXNSVUZCUlN4WFFVRTBRaXhMUVVGSk8wRkJRM0pHTEZsQlFVRXNTMEZCU3l4TlFVRk5MRk5CUVZNc1NVRkJTU3hWUVVGVkxFVkJRVVU3UVVGRGFrTXNaMEpCUVVFc1UwRkJLMElzUTBGQlF5eE5RVUZOTEVWQlFVVXNWMEZCVnl4RFFVRkRMRU5CUVVNN1lVRkRka1E3UVVGRFNDeFRRVUZETEVOQlFVTTdTMEZEU0R0QlFVVk5MRWxCUVVFc1QwRkJUeXgzUWtGQmQwSXNRMEZCUXl4SFFVRkhMRlZCUVhGRExFVkJRVUU3UVVGRE4wVXNVVUZCUVN4UFFVRlBMRU5CUVRaQ0xFMUJRV2xDTEVWQlFVVXNWMEZCTkVJc1JVRkJSU3hqUVVGelFpeExRVUZKTzBGQlF6ZEhMRmxCUVVFc1MwRkJTeXhOUVVGTkxGTkJRVk1zU1VGQlNTeFZRVUZWTEVWQlFVVTdRVUZEYWtNc1owSkJRVUVzVTBGQlowTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1YwRkJWeXhGUVVGRkxHTkJRV01zUTBGQlF5eERRVUZETzJGQlEzaEZPMEZCUTBnc1UwRkJReXhEUVVGRE8wdEJRMGc3UVVGSFRTeEpRVUZCTEU5QlFVOHNkVUpCUVhWQ0xFTkJRVU1zVDBGQlFTeEhRVUZ0UlN4RlFVRkZMRVZCUVVFN1FVRkRla2NzVVVGQlFTeFBRVUZQTEVOQlFVTXNUVUZCWXl4RlFVRkZMRmRCUVRSQ0xFdEJRVWs3V1VGRGRFUXNUVUZCVFN4UFFVRlBMRWRCUVVjc1QwRkJUeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hYUVVGWExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVTTdXVUZETVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4WFFVRlhMRU5CUVVNc1EwRkJRenRCUVVOdVF5eFpRVUZCTEU5QlFVOHNRMEZCUXl4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNWMEZCVnl4RlFVRkZMRTlCUVU4c1EwRkJReXhIUVVGSExGTkJRVk1zUTBGQlF6dEJRVU14UlN4VFFVRkRMRU5CUVVNN1MwRkRTRHRCUVVkTkxFbEJRVUVzVDBGQlR5eHZRa0ZCYjBJc1EwRkJReXhQUVVGQkxFZEJRV2RGTEVWQlFVVXNSVUZCUVR0UlFVTnVSeXhQUVVGUExFTkJRVU1zVFVGQldTeExRVUZKTzBGQlEzUkNMRmxCUVVFc1RVRkJUU3hQUVVGUExFZEJRVWNzVDBGQlR5eERRVUZETEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVTTNSQ3haUVVGQkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRCUVVOMFFpeFpRVUZCTEU5QlFVOHNRMEZCUXl4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRWRCUVVjc1UwRkJVeXhEUVVGRE8wRkJRemRFTEZOQlFVTXNRMEZCUXp0TFFVTklPMEZCUjAwc1NVRkJRU3hQUVVGUExIRkNRVUZ4UWl4RFFVRkRMRTlCUVVFc1IwRkJhVVVzUlVGQlJTeEZRVUZCTzBGQlEzSkhMRkZCUVVFc1QwRkJUeXhEUVVGRExFMUJRV01zUlVGQlJTeFhRVUUwUWl4RlFVRkZMRlZCUVRSRUxFdEJRVWs3V1VGRGNFZ3NUVUZCVFN4UFFVRlBMRWRCUVVjc1QwRkJUeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hYUVVGWExFVkJRVVVzVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMWxCUTNSR0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRGJrTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4WFFVRlhMRVZCUVVVc1ZVRkJWU3hGUVVGRkxFOUJRVThzUTBGQlF5eEhRVUZITEZOQlFWTXNRMEZCUXp0QlFVTjBSaXhUUVVGRExFTkJRVU03UzBGRFNEdEJRVU5HT3pzN095SjlcbiIsImltcG9ydCB7IE5haWx5RGVjb3JhdG9yRmFjdG9yeSB9IGZyb20gJy4uL2NsYXNzZXMvZGVjb3JhdG9yLmZhY3RvcnkuanMnO1xuaW1wb3J0IHsgTmFpbHlCZWFuRmFjdG9yeSwgTmFpbHlCZWFuUmVnaXN0cnkgfSBmcm9tICcuLi9jbGFzc2VzL2luZGV4LmpzJztcblxuZnVuY3Rpb24gSW5qZWN0YWJsZShvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gTmFpbHlEZWNvcmF0b3JGYWN0b3J5LmNyZWF0ZUNsYXNzRGVjb3JhdG9yKHtcbiAgICAgICAgYmVmb3JlKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5mdW5jdGlvbiBTZXJ2aWNlKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBOYWlseURlY29yYXRvckZhY3RvcnkuY3JlYXRlQ2xhc3NEZWNvcmF0b3Ioe1xuICAgICAgICBiZWZvcmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIENvbmZpZ3VyYXRpb24ob3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIE5haWx5RGVjb3JhdG9yRmFjdG9yeS5jcmVhdGVDbGFzc0RlY29yYXRvcih7XG4gICAgICAgIGJlZm9yZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgICB9LFxuICAgICAgICBhZnRlcih0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IEZhY3RvcnkgPSBuZXcgTmFpbHlCZWFuRmFjdG9yeSh0YXJnZXQpO1xuICAgICAgICAgICAgY29uc3QgTWV0YWRhdGEgPSBGYWN0b3J5LmdldEJlYW5NZXRhZGF0YU9yVGhyb3coKTtcbiAgICAgICAgICAgIGNvbnN0IEVsZW1lbnQgPSBOYWlseUJlYW5SZWdpc3RyeS5yZXNvbHZlKE1ldGFkYXRhLlRva2VuKTtcbiAgICAgICAgICAgIGlmIChFbGVtZW50Lmluc3RhbmNlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgRmFjdG9yeS5jcmVhdGVJbnN0YW5jZSgpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgeyBDb25maWd1cmF0aW9uLCBJbmplY3RhYmxlLCBTZXJ2aWNlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFXNXFaV04wWVdKc1pTNWtaV052Y21GMGIzSXVhbk1pTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUx5NHVMM055WXk5amIyMXRiMjR2WkdWamIzSmhkRzl5Y3k5cGJtcGxZM1JoWW14bExtUmxZMjl5WVhSdmNpNTBjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnZXlCT1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua2dmU0JtY205dElGd2lMaTR2WTJ4aGMzTmxjeTlrWldOdmNtRjBiM0l1Wm1GamRHOXllUzVxYzF3aU8xeHVhVzF3YjNKMElIc2dUbUZwYkhsQ1pXRnVSbUZqZEc5eWVTd2dUbUZwYkhsQ1pXRnVVbVZuYVhOMGNua2dmU0JtY205dElGd2lMaTR2WTJ4aGMzTmxjeTlwYm1SbGVDNXFjMXdpTzF4dVhHNWxlSEJ2Y25RZ1puVnVZM1JwYjI0Z1NXNXFaV04wWVdKc1pTaHZjSFJwYjI1elB6b2dVR0Z5ZEdsaGJEeE9TVTlETGtKbFlXNU5aWFJoWkdGMFlUNHBPaUJEYkdGemMwUmxZMjl5WVhSdmNqdGNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQkpibXBsWTNSaFlteGxLRzl3ZEdsdmJuTTZJRkJoY25ScFlXdzhUa2xQUXk1Q1pXRnVUV1YwWVdSaGRHRStJRDBnZTMwcElIdGNiaUFnY21WMGRYSnVJRTVoYVd4NVJHVmpiM0poZEc5eVJtRmpkRzl5ZVM1amNtVmhkR1ZEYkdGemMwUmxZMjl5WVhSdmNpaDdYRzRnSUNBZ1ltVm1iM0psS0NrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUc5d2RHbHZibk03WEc0Z0lDQWdmU3hjYmlBZ2ZTazdYRzU5WEc1Y2JtVjRjRzl5ZENCbWRXNWpkR2x2YmlCVFpYSjJhV05sS0c5d2RHbHZibk0vT2lCUVlYSjBhV0ZzUEU1SlQwTXVRbVZoYmsxbGRHRmtZWFJoUGlrNklFTnNZWE56UkdWamIzSmhkRzl5TzF4dVpYaHdiM0owSUdaMWJtTjBhVzl1SUZObGNuWnBZMlVvYjNCMGFXOXVjem9nVUdGeWRHbGhiRHhPU1U5RExrSmxZVzVOWlhSaFpHRjBZVDRnUFNCN2ZTa2dlMXh1SUNCeVpYUjFjbTRnVG1GcGJIbEVaV052Y21GMGIzSkdZV04wYjNKNUxtTnlaV0YwWlVOc1lYTnpSR1ZqYjNKaGRHOXlLSHRjYmlBZ0lDQmlaV1p2Y21Vb0tTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2IzQjBhVzl1Y3p0Y2JpQWdJQ0I5TEZ4dUlDQjlLVHRjYm4xY2JseHVaWGh3YjNKMElHWjFibU4wYVc5dUlFTnZibVpwWjNWeVlYUnBiMjRvYjNCMGFXOXVjejg2SUZCaGNuUnBZV3c4VGtsUFF5NUNaV0Z1VFdWMFlXUmhkR0UrS1RvZ1EyeGhjM05FWldOdmNtRjBiM0k3WEc1bGVIQnZjblFnWm5WdVkzUnBiMjRnUTI5dVptbG5kWEpoZEdsdmJpaHZjSFJwYjI1ek9pQlFZWEowYVdGc1BFNUpUME11UW1WaGJrMWxkR0ZrWVhSaFBpQTlJSHQ5S1NCN1hHNGdJSEpsZEhWeWJpQk9ZV2xzZVVSbFkyOXlZWFJ2Y2taaFkzUnZjbmt1WTNKbFlYUmxRMnhoYzNORVpXTnZjbUYwYjNJb2UxeHVJQ0FnSUdKbFptOXlaU2dwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJ2Y0hScGIyNXpPMXh1SUNBZ0lIMHNYRzRnSUNBZ1lXWjBaWElvZEdGeVoyVjBLU0I3WEc0Z0lDQWdJQ0JqYjI1emRDQkdZV04wYjNKNUlEMGdibVYzSUU1aGFXeDVRbVZoYmtaaFkzUnZjbmtvZEdGeVoyVjBLVHRjYmlBZ0lDQWdJR052Ym5OMElFMWxkR0ZrWVhSaElEMGdSbUZqZEc5eWVTNW5aWFJDWldGdVRXVjBZV1JoZEdGUGNsUm9jbTkzS0NrN1hHNGdJQ0FnSUNCamIyNXpkQ0JGYkdWdFpXNTBJRDBnVG1GcGJIbENaV0Z1VW1WbmFYTjBjbmt1Y21WemIyeDJaU2hOWlhSaFpHRjBZUzVVYjJ0bGJpazdYRzRnSUNBZ0lDQnBaaUFvUld4bGJXVnVkQzVwYm5OMFlXNWpaU0E5UFQwZ2RXNWtaV1pwYm1Wa0tTQkdZV04wYjNKNUxtTnlaV0YwWlVsdWMzUmhibU5sS0NrN1hHNGdJQ0FnZlN4Y2JpQWdmU2s3WEc1OVhHNGlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPMEZCU1dkQ0xGTkJRVUVzVlVGQlZTeERRVUZETEU5QlFVRXNSMEZCYzBNc1JVRkJSU3hGUVVGQk8wbEJRMnBGTEU5QlFVOHNjVUpCUVhGQ0xFTkJRVU1zYjBKQlFXOUNMRU5CUVVNN1VVRkRhRVFzVFVGQlRTeEhRVUZCTzBGQlEwb3NXVUZCUVN4UFFVRlBMRTlCUVU4c1EwRkJRenRUUVVOb1FqdEJRVU5HTEV0QlFVRXNRMEZCUXl4RFFVRkRPMEZCUTB3c1EwRkJRenRCUVVkbExGTkJRVUVzVDBGQlR5eERRVUZETEU5QlFVRXNSMEZCYzBNc1JVRkJSU3hGUVVGQk8wbEJRemxFTEU5QlFVOHNjVUpCUVhGQ0xFTkJRVU1zYjBKQlFXOUNMRU5CUVVNN1VVRkRhRVFzVFVGQlRTeEhRVUZCTzBGQlEwb3NXVUZCUVN4UFFVRlBMRTlCUVU4c1EwRkJRenRUUVVOb1FqdEJRVU5HTEV0QlFVRXNRMEZCUXl4RFFVRkRPMEZCUTB3c1EwRkJRenRCUVVkbExGTkJRVUVzWVVGQllTeERRVUZETEU5QlFVRXNSMEZCYzBNc1JVRkJSU3hGUVVGQk8wbEJRM0JGTEU5QlFVOHNjVUpCUVhGQ0xFTkJRVU1zYjBKQlFXOUNMRU5CUVVNN1VVRkRhRVFzVFVGQlRTeEhRVUZCTzBGQlEwb3NXVUZCUVN4UFFVRlBMRTlCUVU4c1EwRkJRenRUUVVOb1FqdEJRVU5FTEZGQlFVRXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJRVHRCUVVOV0xGbEJRVUVzVFVGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0QlFVTTNReXhaUVVGQkxFMUJRVTBzVVVGQlVTeEhRVUZITEU5QlFVOHNRMEZCUXl4elFrRkJjMElzUlVGQlJTeERRVUZETzFsQlEyeEVMRTFCUVUwc1QwRkJUeXhIUVVGSExHbENRVUZwUWl4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdRVUZETVVRc1dVRkJRU3hKUVVGSkxFOUJRVThzUTBGQlF5eFJRVUZSTEV0QlFVc3NVMEZCVXp0blFrRkJSU3hQUVVGUExFTkJRVU1zWTBGQll5eEZRVUZGTEVOQlFVTTdVMEZET1VRN1FVRkRSaXhMUVVGQkxFTkJRVU1zUTBGQlF6dEJRVU5NT3pzN095SjlcbiIsImltcG9ydCB7IE5haWx5RGVjb3JhdG9yRmFjdG9yeSB9IGZyb20gJy4uL2NsYXNzZXMvZGVjb3JhdG9yLmZhY3RvcnkuanMnO1xuaW1wb3J0IHsgTmFpbHlCZWFuRmFjdG9yeSB9IGZyb20gJy4uL2NsYXNzZXMvbmFpbHkuZmFjdG9yeS5qcyc7XG5cbmZ1bmN0aW9uIEluamVjdCh2YWwsIGV4dHJhQmVhbk9wdGlvbnMpIHtcbiAgICByZXR1cm4gTmFpbHlEZWNvcmF0b3JGYWN0b3J5LmNyZWF0ZVByb3BlcnR5RGVjb3JhdG9yKHtcbiAgICAgICAgYmVmb3JlKCkge1xuICAgICAgICAgICAgcmV0dXJuIGV4dHJhQmVhbk9wdGlvbnM7XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyKHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJfX25haWx5OmluamVjdF9fXCIgLyogTmFpbHlXYXRlcm1hcmsuSU5KRUNUICovLCB2YWwsIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIHtcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTmFpbHlCZWFuRmFjdG9yeSh2YWwpLmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuZnVuY3Rpb24gQXV0b3dpcmVkKGV4dHJhQmVhbk9wdGlvbnMpIHtcbiAgICByZXR1cm4gKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcbiAgICAgICAgY29uc3QgdHlwaW5nID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBpZiAoIXR5cGluZylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHR5cGluZyBmb3VuZFwiKTtcbiAgICAgICAgSW5qZWN0KHR5cGluZywgZXh0cmFCZWFuT3B0aW9ucykodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgQXV0b3dpcmVkLCBJbmplY3QgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1cVpXTjBMbVJsWTI5eVlYUnZjaTVxY3lJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZMaTR2YzNKakwyTnZiVzF2Ymk5a1pXTnZjbUYwYjNKekwybHVhbVZqZEM1a1pXTnZjbUYwYjNJdWRITWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYVcxd2IzSjBJSHNnVG1GcGJIbEVaV052Y21GMGIzSkdZV04wYjNKNUlIMGdabkp2YlNCY0lpNHVMMk5zWVhOelpYTXZaR1ZqYjNKaGRHOXlMbVpoWTNSdmNua3Vhbk5jSWp0Y2JtbHRjRzl5ZENCN0lFNWhhV3g1UW1WaGJrWmhZM1J2Y25rZ2ZTQm1jbTl0SUZ3aUxpNHZZMnhoYzNObGN5OXVZV2xzZVM1bVlXTjBiM0o1TG1welhDSTdYRzVwYlhCdmNuUWdleUJPWVdsc2VWZGhkR1Z5YldGeWF5QjlJR1p5YjIwZ1hDSXVMaTlqYjI1emRHRnVkSE12YVc1a1pYZ3Vhbk5jSWp0Y2JtbHRjRzl5ZENCN0lGUjVjR1VnZlNCbWNtOXRJRndpTGk0dmRIbHdhVzVuY3k5cGJtUmxlQzVxYzF3aU8xeHVYRzVsZUhCdmNuUWdablZ1WTNScGIyNGdTVzVxWldOMFBGUStLSFpoYkRvZ1ZIbHdaVHhVUGl3Z1pYaDBjbUZDWldGdVQzQjBhVzl1Y3o4NklGQmhjblJwWVd3OFRrbFBReTVDWldGdVRXVjBZV1JoZEdFK0tTQjdYRzRnSUhKbGRIVnliaUJPWVdsc2VVUmxZMjl5WVhSdmNrWmhZM1J2Y25rdVkzSmxZWFJsVUhKdmNHVnlkSGxFWldOdmNtRjBiM0lvZTF4dUlDQWdJR0psWm05eVpTZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmxlSFJ5WVVKbFlXNVBjSFJwYjI1ek8xeHVJQ0FnSUgwc1hHNGdJQ0FnWVdaMFpYSW9kR0Z5WjJWMExDQndjbTl3WlhKMGVVdGxlU2tnZTF4dUlDQWdJQ0FnVW1WbWJHVmpkQzVrWldacGJtVk5aWFJoWkdGMFlTaE9ZV2xzZVZkaGRHVnliV0Z5YXk1SlRrcEZRMVFzSUhaaGJDd2dkR0Z5WjJWMExDQndjbTl3WlhKMGVVdGxlU2s3WEc0Z0lDQWdJQ0JQWW1wbFkzUXVaR1ZtYVc1bFVISnZjR1Z5ZEhrb2RHRnlaMlYwTENCd2NtOXdaWEowZVV0bGVTd2dlMXh1SUNBZ0lDQWdJQ0JuWlhRb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJRzVsZHlCT1lXbHNlVUpsWVc1R1lXTjBiM0o1S0haaGJDa3VZM0psWVhSbFNXNXpkR0Z1WTJVb0tUdGNiaUFnSUNBZ0lDQWdmU3hjYmlBZ0lDQWdJSDBwTzF4dUlDQWdJSDBzWEc0Z0lIMHBPMXh1ZlZ4dVhHNWxlSEJ2Y25RZ1puVnVZM1JwYjI0Z1FYVjBiM2RwY21Wa0tHVjRkSEpoUW1WaGJrOXdkR2x2Ym5NL09pQlFZWEowYVdGc1BFNUpUME11UW1WaGJrMWxkR0ZrWVhSaFBpa2dlMXh1SUNCeVpYUjFjbTRnS0hSaGNtZGxkRG9nVDJKcVpXTjBMQ0J3Y205d1pYSjBlVXRsZVRvZ2MzUnlhVzVuSUh3Z2MzbHRZbTlzS1NBOVBpQjdYRzRnSUNBZ1kyOXVjM1FnZEhsd2FXNW5JRDBnVW1WbWJHVmpkQzVuWlhSTlpYUmhaR0YwWVNoY0ltUmxjMmxuYmpwMGVYQmxYQ0lzSUhSaGNtZGxkQ3dnY0hKdmNHVnlkSGxMWlhrcE8xeHVJQ0FnSUdsbUlDZ2hkSGx3YVc1bktTQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb1hDSk9ieUIwZVhCcGJtY2dabTkxYm1SY0lpazdYRzRnSUNBZ1NXNXFaV04wS0hSNWNHbHVaeUJoY3lCVWVYQmxMQ0JsZUhSeVlVSmxZVzVQY0hScGIyNXpLU2gwWVhKblpYUXNJSEJ5YjNCbGNuUjVTMlY1S1R0Y2JpQWdmVHRjYm4xY2JpSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdRVUZMWjBJc1UwRkJRU3hOUVVGTkxFTkJRVWtzUjBGQldTeEZRVUZGTEdkQ1FVRTJReXhGUVVGQk8wbEJRMjVHTEU5QlFVOHNjVUpCUVhGQ0xFTkJRVU1zZFVKQlFYVkNMRU5CUVVNN1VVRkRia1FzVFVGQlRTeEhRVUZCTzBGQlEwb3NXVUZCUVN4UFFVRlBMR2RDUVVGblFpeERRVUZETzFOQlEzcENPMUZCUTBRc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeFhRVUZYTEVWQlFVRTdXVUZEZGtJc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQmQwSXNhMEpCUVVFc09FSkJRVUVzUjBGQlJ5eEZRVUZGTEUxQlFVMHNSVUZCUlN4WFFVRlhMRU5CUVVNc1EwRkJRenRCUVVONFJTeFpRVUZCTEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1RVRkJUU3hGUVVGRkxGZEJRVmNzUlVGQlJUdG5Ra0ZEZWtNc1IwRkJSeXhIUVVGQk8yOUNRVU5FTEU5QlFVOHNTVUZCU1N4blFrRkJaMElzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJRenRwUWtGRGJrUTdRVUZEUml4aFFVRkJMRU5CUVVNc1EwRkJRenRUUVVOS08wRkJRMFlzUzBGQlFTeERRVUZETEVOQlFVTTdRVUZEVEN4RFFVRkRPMEZCUlVzc1UwRkJWU3hUUVVGVExFTkJRVU1zWjBKQlFUWkRMRVZCUVVFN1FVRkRja1VzU1VGQlFTeFBRVUZQTEVOQlFVTXNUVUZCWXl4RlFVRkZMRmRCUVRSQ0xFdEJRVWs3UVVGRGRFUXNVVUZCUVN4TlFVRk5MRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEdGQlFXRXNSVUZCUlN4TlFVRk5MRVZCUVVVc1YwRkJWeXhEUVVGRExFTkJRVU03UVVGRGRrVXNVVUZCUVN4SlFVRkpMRU5CUVVNc1RVRkJUVHRCUVVGRkxGbEJRVUVzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eERRVUZETzFGQlEyaEVMRTFCUVUwc1EwRkJReXhOUVVGakxFVkJRVVVzWjBKQlFXZENMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVVzVjBGQlZ5eERRVUZETEVOQlFVTTdRVUZEYUVVc1MwRkJReXhEUVVGRE8wRkJRMG83T3pzN0luMD1cbiIsImNvbnN0IEFMSUFTID0gU3ltYm9sLmZvcigneWFtbC5hbGlhcycpO1xuY29uc3QgRE9DID0gU3ltYm9sLmZvcigneWFtbC5kb2N1bWVudCcpO1xuY29uc3QgTUFQID0gU3ltYm9sLmZvcigneWFtbC5tYXAnKTtcbmNvbnN0IFBBSVIgPSBTeW1ib2wuZm9yKCd5YW1sLnBhaXInKTtcbmNvbnN0IFNDQUxBUiA9IFN5bWJvbC5mb3IoJ3lhbWwuc2NhbGFyJyk7XG5jb25zdCBTRVEgPSBTeW1ib2wuZm9yKCd5YW1sLnNlcScpO1xuY29uc3QgTk9ERV9UWVBFID0gU3ltYm9sLmZvcigneWFtbC5ub2RlLnR5cGUnKTtcbmNvbnN0IGlzQWxpYXMgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IEFMSUFTO1xuY29uc3QgaXNEb2N1bWVudCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gRE9DO1xuY29uc3QgaXNNYXAgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IE1BUDtcbmNvbnN0IGlzUGFpciA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gUEFJUjtcbmNvbnN0IGlzU2NhbGFyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTQ0FMQVI7XG5jb25zdCBpc1NlcSA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gU0VRO1xuZnVuY3Rpb24gaXNDb2xsZWN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIEFMSUFTOlxuICAgICAgICAgICAgY2FzZSBNQVA6XG4gICAgICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY29uc3QgaGFzQW5jaG9yID0gKG5vZGUpID0+IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmICEhbm9kZS5hbmNob3I7XG5cbmV4cG9ydCB7IEFMSUFTLCBET0MsIE1BUCwgTk9ERV9UWVBFLCBQQUlSLCBTQ0FMQVIsIFNFUSwgaGFzQW5jaG9yLCBpc0FsaWFzLCBpc0NvbGxlY3Rpb24sIGlzRG9jdW1lbnQsIGlzTWFwLCBpc05vZGUsIGlzUGFpciwgaXNTY2FsYXIsIGlzU2VxIH07XG4iLCJpbXBvcnQgeyBpc0RvY3VtZW50LCBpc05vZGUsIGlzUGFpciwgaXNDb2xsZWN0aW9uLCBpc01hcCwgaXNTZXEsIGlzU2NhbGFyLCBpc0FsaWFzIH0gZnJvbSAnLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgbm9kZScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiB2aXNpdChub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IHZpc2l0XyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB2aXNpdF8obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG5mdW5jdGlvbiB2aXNpdF8oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0XyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gdmlzaXRfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IHZpc2l0Xygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gdmlzaXRfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuLyoqXG4gKiBBcHBseSBhbiBhc3luYyB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgUHJvbWlzZWA6IE11c3QgcmVzb2x2ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXNcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luYyhub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0QXN5bmMuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuUkVNT1ZFID0gUkVNT1ZFO1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luY18oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGF3YWl0IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0QXN5bmNfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBhd2FpdCB2aXNpdEFzeW5jXyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSBhd2FpdCB2aXNpdEFzeW5jXygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gYXdhaXQgdmlzaXRBc3luY18oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG5mdW5jdGlvbiBpbml0VmlzaXRvcih2aXNpdG9yKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAodmlzaXRvci5Db2xsZWN0aW9uIHx8IHZpc2l0b3IuTm9kZSB8fCB2aXNpdG9yLlZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBBbGlhczogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Ob2RlXG4gICAgICAgIH0sIHZpc2l0b3IuVmFsdWUgJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLlZhbHVlXG4gICAgICAgIH0sIHZpc2l0b3IuQ29sbGVjdGlvbiAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuQ29sbGVjdGlvbixcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Db2xsZWN0aW9uXG4gICAgICAgIH0sIHZpc2l0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvcjtcbn1cbmZ1bmN0aW9uIGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHZpc2l0b3Ioa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNNYXAobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLk1hcD8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzU2VxKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TZXE/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1BhaXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlBhaXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1NjYWxhcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2NhbGFyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNBbGlhcyhub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuQWxpYXM/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiByZXBsYWNlTm9kZShrZXksIHBhdGgsIG5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgaWYgKGlzQ29sbGVjdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5pdGVtc1trZXldID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQYWlyKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2tleScpXG4gICAgICAgICAgICBwYXJlbnQua2V5ID0gbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyZW50LnZhbHVlID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNEb2N1bWVudChwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5jb250ZW50cyA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwdCA9IGlzQWxpYXMocGFyZW50KSA/ICdhbGlhcycgOiAnc2NhbGFyJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVwbGFjZSBub2RlIHdpdGggJHtwdH0gcGFyZW50YCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyB2aXNpdCwgdmlzaXRBc3luYyB9O1xuIiwiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5cbmNvbnN0IGVzY2FwZUNoYXJzID0ge1xuICAgICchJzogJyUyMScsXG4gICAgJywnOiAnJTJDJyxcbiAgICAnWyc6ICclNUInLFxuICAgICddJzogJyU1RCcsXG4gICAgJ3snOiAnJTdCJyxcbiAgICAnfSc6ICclN0QnXG59O1xuY29uc3QgZXNjYXBlVGFnTmFtZSA9ICh0bikgPT4gdG4ucmVwbGFjZSgvWyEsW1xcXXt9XS9nLCBjaCA9PiBlc2NhcGVDaGFyc1tjaF0pO1xuY2xhc3MgRGlyZWN0aXZlcyB7XG4gICAgY29uc3RydWN0b3IoeWFtbCwgdGFncykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBtYXJrZXIgYC0tLWAuIElmIGBudWxsYCwgYSBtYXJrZXIgbWF5IHN0aWxsIGJlXG4gICAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCdzIHN0cmluZ2lmaWVkIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kb2NTdGFydCA9IG51bGw7XG4gICAgICAgIC8qKiBUaGUgZG9jLWVuZCBtYXJrZXIgYC4uLmAuICAqL1xuICAgICAgICB0aGlzLmRvY0VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnlhbWwgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLCB5YW1sKTtcbiAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncywgdGFncyk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBjb3B5LmRvY1N0YXJ0ID0gdGhpcy5kb2NTdGFydDtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIER1cmluZyBwYXJzaW5nLCBnZXQgYSBEaXJlY3RpdmVzIGluc3RhbmNlIGZvciB0aGUgY3VycmVudCBkb2N1bWVudCBhbmRcbiAgICAgKiB1cGRhdGUgdGhlIHN0cmVhbSBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgdmVyc2lvbidzIHNwZWMuXG4gICAgICovXG4gICAgYXREb2N1bWVudCgpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMueWFtbC52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXh0RG9jdW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy55YW1sID0ge1xuICAgICAgICAgICAgICAgICAgICBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbkVycm9yIC0gTWF5IGJlIGNhbGxlZCBldmVuIGlmIHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzc1xuICAgICAqL1xuICAgIGFkZChsaW5lLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmF0TmV4dERvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnlhbWwgPSB7IGV4cGxpY2l0OiBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLmV4cGxpY2l0LCB2ZXJzaW9uOiAnMS4xJyB9O1xuICAgICAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncyk7XG4gICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvWyBcXHRdKy8pO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICclVEFHJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVRBRyBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSB0d28gcGFydHMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3NbaGFuZGxlXSA9IHByZWZpeDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJyVZQU1MJzoge1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbC5leHBsaWNpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDAsICclWUFNTCBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgcGFydCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uXSA9IHBhcnRzO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAnMS4xJyB8fCB2ZXJzaW9uID09PSAnMS4yJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkK1xcLlxcZCskLy50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDYsIGBVbnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gJHt2ZXJzaW9ufWAsIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKDAsIGBVbmtub3duIGRpcmVjdGl2ZSAke25hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIGEgdGFnLCBtYXRjaGluZyBoYW5kbGVzIHRvIHRob3NlIGRlZmluZWQgaW4gJVRBRyBkaXJlY3RpdmVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmVzb2x2ZWQgdGFnLCB3aGljaCBtYXkgYWxzbyBiZSB0aGUgbm9uLXNwZWNpZmljIHRhZyBgJyEnYCBvciBhXG4gICAgICogICBgJyFsb2NhbCdgIHRhZywgb3IgYG51bGxgIGlmIHVucmVzb2x2YWJsZS5cbiAgICAgKi9cbiAgICB0YWdOYW1lKHNvdXJjZSwgb25FcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gJyEnOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgICAgIGlmIChzb3VyY2VbMF0gIT09ICchJykge1xuICAgICAgICAgICAgb25FcnJvcihgTm90IGEgdmFsaWQgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VbMV0gPT09ICc8Jykge1xuICAgICAgICAgICAgY29uc3QgdmVyYmF0aW0gPSBzb3VyY2Uuc2xpY2UoMiwgLTEpO1xuICAgICAgICAgICAgaWYgKHZlcmJhdGltID09PSAnIScgfHwgdmVyYmF0aW0gPT09ICchIScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGBWZXJiYXRpbSB0YWdzIGFyZW4ndCByZXNvbHZlZCwgc28gJHtzb3VyY2V9IGlzIGludmFsaWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1ZlcmJhdGltIHRhZ3MgbXVzdCBlbmQgd2l0aCBhID4nKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJiYXRpbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbLCBoYW5kbGUsIHN1ZmZpeF0gPSBzb3VyY2UubWF0Y2goL14oLiohKShbXiFdKikkL3MpO1xuICAgICAgICBpZiAoIXN1ZmZpeClcbiAgICAgICAgICAgIG9uRXJyb3IoYFRoZSAke3NvdXJjZX0gdGFnIGhhcyBubyBzdWZmaXhgKTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy50YWdzW2hhbmRsZV07XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGRlY29kZVVSSUNvbXBvbmVudChzdWZmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gc291cmNlOyAvLyBsb2NhbCB0YWdcbiAgICAgICAgb25FcnJvcihgQ291bGQgbm90IHJlc29sdmUgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgZnVsbHkgcmVzb2x2ZWQgdGFnLCByZXR1cm5zIGl0cyBwcmludGFibGUgc3RyaW5nIGZvcm0sXG4gICAgICogdGFraW5nIGludG8gYWNjb3VudCBjdXJyZW50IHRhZyBwcmVmaXhlcyBhbmQgZGVmYXVsdHMuXG4gICAgICovXG4gICAgdGFnU3RyaW5nKHRhZykge1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy50YWdzKSkge1xuICAgICAgICAgICAgaWYgKHRhZy5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZSArIGVzY2FwZVRhZ05hbWUodGFnLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1swXSA9PT0gJyEnID8gdGFnIDogYCE8JHt0YWd9PmA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGRvYykge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMueWFtbC5leHBsaWNpdFxuICAgICAgICAgICAgPyBbYCVZQU1MICR7dGhpcy55YW1sLnZlcnNpb24gfHwgJzEuMid9YF1cbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IHRhZ0VudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLnRhZ3MpO1xuICAgICAgICBsZXQgdGFnTmFtZXM7XG4gICAgICAgIGlmIChkb2MgJiYgdGFnRW50cmllcy5sZW5ndGggPiAwICYmIGlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0ge307XG4gICAgICAgICAgICB2aXNpdChkb2MuY29udGVudHMsIChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9kZShub2RlKSAmJiBub2RlLnRhZylcbiAgICAgICAgICAgICAgICAgICAgdGFnc1tub2RlLnRhZ10gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhZ05hbWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW2hhbmRsZSwgcHJlZml4XSBvZiB0YWdFbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlID09PSAnISEnICYmIHByZWZpeCA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWRvYyB8fCB0YWdOYW1lcy5zb21lKHRuID0+IHRuLnN0YXJ0c1dpdGgocHJlZml4KSkpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIH1cbn1cbkRpcmVjdGl2ZXMuZGVmYXVsdFlhbWwgPSB7IGV4cGxpY2l0OiBmYWxzZSwgdmVyc2lvbjogJzEuMicgfTtcbkRpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MgPSB7ICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonIH07XG5cbmV4cG9ydCB7IERpcmVjdGl2ZXMgfTtcbiIsImltcG9ydCB7IGlzU2NhbGFyLCBpc0NvbGxlY3Rpb24gfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gJy4uL3Zpc2l0LmpzJztcblxuLyoqXG4gKiBWZXJpZnkgdGhhdCB0aGUgaW5wdXQgc3RyaW5nIGlzIGEgdmFsaWQgYW5jaG9yLlxuICpcbiAqIFdpbGwgdGhyb3cgb24gZXJyb3JzLlxuICovXG5mdW5jdGlvbiBhbmNob3JJc1ZhbGlkKGFuY2hvcikge1xuICAgIGlmICgvW1xceDAwLVxceDE5XFxzLFtcXF17fV0vLnRlc3QoYW5jaG9yKSkge1xuICAgICAgICBjb25zdCBzYSA9IEpTT04uc3RyaW5naWZ5KGFuY2hvcik7XG4gICAgICAgIGNvbnN0IG1zZyA9IGBBbmNob3IgbXVzdCBub3QgY29udGFpbiB3aGl0ZXNwYWNlIG9yIGNvbnRyb2wgY2hhcmFjdGVyczogJHtzYX1gO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBhbmNob3JOYW1lcyhyb290KSB7XG4gICAgY29uc3QgYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICB2aXNpdChyb290LCB7XG4gICAgICAgIFZhbHVlKF9rZXksIG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmFuY2hvcilcbiAgICAgICAgICAgICAgICBhbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYW5jaG9ycztcbn1cbi8qKiBGaW5kIGEgbmV3IGFuY2hvciBuYW1lIHdpdGggdGhlIGdpdmVuIGBwcmVmaXhgIGFuZCBhIG9uZS1pbmRleGVkIHN1ZmZpeC4gKi9cbmZ1bmN0aW9uIGZpbmROZXdBbmNob3IocHJlZml4LCBleGNsdWRlKSB7XG4gICAgZm9yIChsZXQgaSA9IDE7IHRydWU7ICsraSkge1xuICAgICAgICBjb25zdCBuYW1lID0gYCR7cHJlZml4fSR7aX1gO1xuICAgICAgICBpZiAoIWV4Y2x1ZGUuaGFzKG5hbWUpKVxuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlTm9kZUFuY2hvcnMoZG9jLCBwcmVmaXgpIHtcbiAgICBjb25zdCBhbGlhc09iamVjdHMgPSBbXTtcbiAgICBjb25zdCBzb3VyY2VPYmplY3RzID0gbmV3IE1hcCgpO1xuICAgIGxldCBwcmV2QW5jaG9ycyA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25BbmNob3I6IChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgIGFsaWFzT2JqZWN0cy5wdXNoKHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoIXByZXZBbmNob3JzKVxuICAgICAgICAgICAgICAgIHByZXZBbmNob3JzID0gYW5jaG9yTmFtZXMoZG9jKTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGZpbmROZXdBbmNob3IocHJlZml4LCBwcmV2QW5jaG9ycyk7XG4gICAgICAgICAgICBwcmV2QW5jaG9ycy5hZGQoYW5jaG9yKTtcbiAgICAgICAgICAgIHJldHVybiBhbmNob3I7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaXRoIGNpcmN1bGFyIHJlZmVyZW5jZXMsIHRoZSBzb3VyY2Ugbm9kZSBpcyBvbmx5IHJlc29sdmVkIGFmdGVyIGFsbFxuICAgICAgICAgKiBvZiBpdHMgY2hpbGQgbm9kZXMgYXJlLiBUaGlzIGlzIHdoeSBhbmNob3JzIGFyZSBzZXQgb25seSBhZnRlciBhbGwgb2ZcbiAgICAgICAgICogdGhlIG5vZGVzIGhhdmUgYmVlbiBjcmVhdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QW5jaG9yczogKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgYWxpYXNPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gc291cmNlT2JqZWN0cy5nZXQoc291cmNlKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVmLmFuY2hvciAmJlxuICAgICAgICAgICAgICAgICAgICAoaXNTY2FsYXIocmVmLm5vZGUpIHx8IGlzQ29sbGVjdGlvbihyZWYubm9kZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZi5ub2RlLmFuY2hvciA9IHJlZi5hbmNob3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignRmFpbGVkIHRvIHJlc29sdmUgcmVwZWF0ZWQgb2JqZWN0ICh0aGlzIHNob3VsZCBub3QgaGFwcGVuKScpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvci5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc291cmNlT2JqZWN0c1xuICAgIH07XG59XG5cbmV4cG9ydCB7IGFuY2hvcklzVmFsaWQsIGFuY2hvck5hbWVzLCBjcmVhdGVOb2RlQW5jaG9ycywgZmluZE5ld0FuY2hvciB9O1xuIiwiLyoqXG4gKiBBcHBsaWVzIHRoZSBKU09OLnBhcnNlIHJldml2ZXIgYWxnb3JpdGhtIGFzIGRlZmluZWQgaW4gdGhlIEVDTUEtMjYyIHNwZWMsXG4gKiBpbiBzZWN0aW9uIDI0LjUuMS4xIFwiUnVudGltZSBTZW1hbnRpY3M6IEludGVybmFsaXplSlNPTlByb3BlcnR5XCIgb2YgdGhlXG4gKiAyMDIxIGVkaXRpb246IGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtanNvbi5wYXJzZVxuICpcbiAqIEluY2x1ZGVzIGV4dGVuc2lvbnMgZm9yIGhhbmRsaW5nIE1hcCBhbmQgU2V0IG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UmV2aXZlcihyZXZpdmVyLCBvYmosIGtleSwgdmFsKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBTdHJpbmcoaSksIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtpXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbFtpXSA9IHYxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrIG9mIEFycmF5LmZyb20odmFsLmtleXMoKSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MCA9IHZhbC5nZXQoayk7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBrLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUoayk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWwuc2V0KGssIHYxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdjAgb2YgQXJyYXkuZnJvbSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCB2MCwgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKHYwKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5hZGQodjEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHYwXSBvZiBPYmplY3QuZW50cmllcyh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBrLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxba107XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxba10gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV2aXZlci5jYWxsKG9iaiwga2V5LCB2YWwpO1xufVxuXG5leHBvcnQgeyBhcHBseVJldml2ZXIgfTtcbiIsImltcG9ydCB7IGhhc0FuY2hvciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgYW55IG5vZGUgb3IgaXRzIGNvbnRlbnRzIHRvIG5hdGl2ZSBKYXZhU2NyaXB0XG4gKlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIGlucHV0IHZhbHVlXG4gKiBAcGFyYW0gYXJnIC0gSWYgYHZhbHVlYCBkZWZpbmVzIGEgYHRvSlNPTigpYCBtZXRob2QsIHVzZSB0aGlzXG4gKiAgIGFzIGl0cyBmaXJzdCBhcmd1bWVudFxuICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpLiBJZlxuICogICBgeyBrZWVwOiB0cnVlIH1gIGlzIG5vdCBzZXQsIG91dHB1dCBzaG91bGQgYmUgc3VpdGFibGUgZm9yIEpTT05cbiAqICAgc3RyaW5naWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiB0b0pTKHZhbHVlLCBhcmcsIGN0eCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaSkgPT4gdG9KUyh2LCBTdHJpbmcoaSksIGN0eCkpO1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgaWYgKCFjdHggfHwgIWhhc0FuY2hvcih2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgYWxpYXNDb3VudDogMCwgY291bnQ6IDEsIHJlczogdW5kZWZpbmVkIH07XG4gICAgICAgIGN0eC5hbmNob3JzLnNldCh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGN0eC5vbkNyZWF0ZSA9IHJlcyA9PiB7XG4gICAgICAgICAgICBkYXRhLnJlcyA9IHJlcztcbiAgICAgICAgICAgIGRlbGV0ZSBjdHgub25DcmVhdGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGlmIChjdHgub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgJiYgIWN0eD8ua2VlcClcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgeyB0b0pTIH07XG4iLCJpbXBvcnQgeyBhcHBseVJldml2ZXIgfSBmcm9tICcuLi9kb2MvYXBwbHlSZXZpdmVyLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgaXNEb2N1bWVudCB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNsYXNzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IHR5cGUgfSk7XG4gICAgfVxuICAgIC8qKiBDcmVhdGUgYSBjb3B5IG9mIHRoaXMgbm9kZS4gICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQSBwbGFpbiBKYXZhU2NyaXB0IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbm9kZS4gKi9cbiAgICB0b0pTKGRvYywgeyBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGlmICghaXNEb2N1bWVudChkb2MpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBkb2N1bWVudCBhcmd1bWVudCBpcyByZXF1aXJlZCcpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICBrZWVwOiB0cnVlLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUyh0aGlzLCAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG59XG5cbmV4cG9ydCB7IE5vZGVCYXNlIH07XG4iLCJpbXBvcnQgeyBhbmNob3JJc1ZhbGlkIH0gZnJvbSAnLi4vZG9jL2FuY2hvcnMuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5pbXBvcnQgeyBBTElBUywgaXNBbGlhcywgaXNDb2xsZWN0aW9uLCBpc1BhaXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBBbGlhcyBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICAgICAgc3VwZXIoQUxJQVMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0YWcnLCB7XG4gICAgICAgICAgICBzZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbGlhcyBub2RlcyBjYW5ub3QgaGF2ZSB0YWdzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSBvZiB0aGlzIGFsaWFzIHdpdGhpbiBgZG9jYCwgZmluZGluZyB0aGUgbGFzdFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBgc291cmNlYCBhbmNob3IgYmVmb3JlIHRoaXMgbm9kZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKGRvYykge1xuICAgICAgICBsZXQgZm91bmQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZpc2l0KGRvYywge1xuICAgICAgICAgICAgTm9kZTogKF9rZXksIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0LkJSRUFLO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gdGhpcy5zb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgdG9KU09OKF9hcmcsIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiB7IHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgY29uc3QgeyBhbmNob3JzLCBkb2MsIG1heEFsaWFzQ291bnQgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5yZXNvbHZlKGRvYyk7XG4gICAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBgVW5yZXNvbHZlZCBhbGlhcyAodGhlIGFuY2hvciBtdXN0IGJlIHNldCBiZWZvcmUgdGhlIGFsaWFzKTogJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIC8vIFJlc29sdmUgYW5jaG9ycyBmb3IgTm9kZS5wcm90b3R5cGUudG9KUygpXG4gICAgICAgICAgICB0b0pTKHNvdXJjZSwgbnVsbCwgY3R4KTtcbiAgICAgICAgICAgIGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoIWRhdGEgfHwgZGF0YS5yZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW46IEFsaWFzIGFuY2hvciB3YXMgbm90IHJlc29sdmVkPyc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF4QWxpYXNDb3VudCA+PSAwKSB7XG4gICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5hbGlhc0NvdW50ID09PSAwKVxuICAgICAgICAgICAgICAgIGRhdGEuYWxpYXNDb3VudCA9IGdldEFsaWFzQ291bnQoZG9jLCBzb3VyY2UsIGFuY2hvcnMpO1xuICAgICAgICAgICAgaWYgKGRhdGEuY291bnQgKiBkYXRhLmFsaWFzQ291bnQgPiBtYXhBbGlhc0NvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gJ0V4Y2Vzc2l2ZSBhbGlhcyBjb3VudCBpbmRpY2F0ZXMgYSByZXNvdXJjZSBleGhhdXN0aW9uIGF0dGFjayc7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGEucmVzO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIF9vbkNvbW1lbnQsIF9vbkNob21wS2VlcCkge1xuICAgICAgICBjb25zdCBzcmMgPSBgKiR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgYW5jaG9ySXNWYWxpZCh0aGlzLnNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMudmVyaWZ5QWxpYXNPcmRlciAmJiAhY3R4LmFuY2hvcnMuaGFzKHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzcmN9IGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRBbGlhc0NvdW50KGRvYywgbm9kZSwgYW5jaG9ycykge1xuICAgIGlmIChpc0FsaWFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5vZGUucmVzb2x2ZShkb2MpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBhbmNob3JzICYmIHNvdXJjZSAmJiBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYW5jaG9yID8gYW5jaG9yLmNvdW50ICogYW5jaG9yLmFsaWFzQ291bnQgOiAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5vZGUuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRBbGlhc0NvdW50KGRvYywgaXRlbSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoYyA+IGNvdW50KVxuICAgICAgICAgICAgICAgIGNvdW50ID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICBjb25zdCBrYyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLmtleSwgYW5jaG9ycyk7XG4gICAgICAgIGNvbnN0IHZjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUudmFsdWUsIGFuY2hvcnMpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoa2MsIHZjKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydCB7IEFsaWFzIH07XG4iLCJpbXBvcnQgeyBTQ0FMQVIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jb25zdCBpc1NjYWxhclZhbHVlID0gKHZhbHVlKSA9PiAhdmFsdWUgfHwgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKTtcbmNsYXNzIFNjYWxhciBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgICAgICBzdXBlcihTQ0FMQVIpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihhcmcsIGN0eCkge1xuICAgICAgICByZXR1cm4gY3R4Py5rZWVwID8gdGhpcy52YWx1ZSA6IHRvSlModGhpcy52YWx1ZSwgYXJnLCBjdHgpO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICB9XG59XG5TY2FsYXIuQkxPQ0tfRk9MREVEID0gJ0JMT0NLX0ZPTERFRCc7XG5TY2FsYXIuQkxPQ0tfTElURVJBTCA9ICdCTE9DS19MSVRFUkFMJztcblNjYWxhci5QTEFJTiA9ICdQTEFJTic7XG5TY2FsYXIuUVVPVEVfRE9VQkxFID0gJ1FVT1RFX0RPVUJMRSc7XG5TY2FsYXIuUVVPVEVfU0lOR0xFID0gJ1FVT1RFX1NJTkdMRSc7XG5cbmV4cG9ydCB7IFNjYWxhciwgaXNTY2FsYXJWYWx1ZSB9O1xuIiwiaW1wb3J0IHsgQWxpYXMgfSBmcm9tICcuLi9ub2Rlcy9BbGlhcy5qcyc7XG5pbXBvcnQgeyBpc05vZGUsIGlzUGFpciwgTUFQLCBTRVEsIGlzRG9jdW1lbnQgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5jb25zdCBkZWZhdWx0VGFnUHJlZml4ID0gJ3RhZzp5YW1sLm9yZywyMDAyOic7XG5mdW5jdGlvbiBmaW5kVGFnT2JqZWN0KHZhbHVlLCB0YWdOYW1lLCB0YWdzKSB7XG4gICAgaWYgKHRhZ05hbWUpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWdOYW1lKTtcbiAgICAgICAgY29uc3QgdGFnT2JqID0gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCkgPz8gbWF0Y2hbMF07XG4gICAgICAgIGlmICghdGFnT2JqKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgJHt0YWdOYW1lfSBub3QgZm91bmRgKTtcbiAgICAgICAgcmV0dXJuIHRhZ09iajtcbiAgICB9XG4gICAgcmV0dXJuIHRhZ3MuZmluZCh0ID0+IHQuaWRlbnRpZnk/Lih2YWx1ZSkgJiYgIXQuZm9ybWF0KTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGUodmFsdWUsIHRhZ05hbWUsIGN0eCkge1xuICAgIGlmIChpc0RvY3VtZW50KHZhbHVlKSlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb250ZW50cztcbiAgICBpZiAoaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmIChpc1BhaXIodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IGN0eC5zY2hlbWFbTUFQXS5jcmVhdGVOb2RlPy4oY3R4LnNjaGVtYSwgbnVsbCwgY3R4KTtcbiAgICAgICAgbWFwLml0ZW1zLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBOdW1iZXIgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBCb29sZWFuIHx8XG4gICAgICAgICh0eXBlb2YgQmlnSW50ICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEJpZ0ludCkgLy8gbm90IHN1cHBvcnRlZCBldmVyeXdoZXJlXG4gICAgKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtc2VyaWFsaXplanNvbnByb3BlcnR5XG4gICAgICAgIHZhbHVlID0gdmFsdWUudmFsdWVPZigpO1xuICAgIH1cbiAgICBjb25zdCB7IGFsaWFzRHVwbGljYXRlT2JqZWN0cywgb25BbmNob3IsIG9uVGFnT2JqLCBzY2hlbWEsIHNvdXJjZU9iamVjdHMgfSA9IGN0eDtcbiAgICAvLyBEZXRlY3QgZHVwbGljYXRlIHJlZmVyZW5jZXMgdG8gdGhlIHNhbWUgb2JqZWN0ICYgdXNlIEFsaWFzIG5vZGVzIGZvciBhbGxcbiAgICAvLyBhZnRlciBmaXJzdC4gVGhlIGByZWZgIHdyYXBwZXIgYWxsb3dzIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgbGV0IHJlZiA9IHVuZGVmaW5lZDtcbiAgICBpZiAoYWxpYXNEdXBsaWNhdGVPYmplY3RzICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmVmID0gc291cmNlT2JqZWN0cy5nZXQodmFsdWUpO1xuICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICBpZiAoIXJlZi5hbmNob3IpXG4gICAgICAgICAgICAgICAgcmVmLmFuY2hvciA9IG9uQW5jaG9yKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWxpYXMocmVmLmFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZWYgPSB7IGFuY2hvcjogbnVsbCwgbm9kZTogbnVsbCB9O1xuICAgICAgICAgICAgc291cmNlT2JqZWN0cy5zZXQodmFsdWUsIHJlZik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRhZ05hbWU/LnN0YXJ0c1dpdGgoJyEhJykpXG4gICAgICAgIHRhZ05hbWUgPSBkZWZhdWx0VGFnUHJlZml4ICsgdGFnTmFtZS5zbGljZSgyKTtcbiAgICBsZXQgdGFnT2JqID0gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgc2NoZW1hLnRhZ3MpO1xuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIodmFsdWUpO1xuICAgICAgICAgICAgaWYgKHJlZilcbiAgICAgICAgICAgICAgICByZWYubm9kZSA9IG5vZGU7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICB0YWdPYmogPVxuICAgICAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBNYXBcbiAgICAgICAgICAgICAgICA/IHNjaGVtYVtNQVBdXG4gICAgICAgICAgICAgICAgOiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICA/IHNjaGVtYVtTRVFdXG4gICAgICAgICAgICAgICAgICAgIDogc2NoZW1hW01BUF07XG4gICAgfVxuICAgIGlmIChvblRhZ09iaikge1xuICAgICAgICBvblRhZ09iaih0YWdPYmopO1xuICAgICAgICBkZWxldGUgY3R4Lm9uVGFnT2JqO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdGFnT2JqPy5jcmVhdGVOb2RlXG4gICAgICAgID8gdGFnT2JqLmNyZWF0ZU5vZGUoY3R4LnNjaGVtYSwgdmFsdWUsIGN0eClcbiAgICAgICAgOiB0eXBlb2YgdGFnT2JqPy5ub2RlQ2xhc3M/LmZyb20gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gdGFnT2JqLm5vZGVDbGFzcy5mcm9tKGN0eC5zY2hlbWEsIHZhbHVlLCBjdHgpXG4gICAgICAgICAgICA6IG5ldyBTY2FsYXIodmFsdWUpO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgZWxzZSBpZiAoIXRhZ09iai5kZWZhdWx0KVxuICAgICAgICBub2RlLnRhZyA9IHRhZ09iai50YWc7XG4gICAgaWYgKHJlZilcbiAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgIHJldHVybiBub2RlO1xufVxuXG5leHBvcnQgeyBjcmVhdGVOb2RlIH07XG4iLCJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcblxuZnVuY3Rpb24gY29sbGVjdGlvbkZyb21QYXRoKHNjaGVtYSwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgdiA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwYXRoW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaykgJiYgayA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gW107XG4gICAgICAgICAgICBhW2tdID0gdjtcbiAgICAgICAgICAgIHYgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdiA9IG5ldyBNYXAoW1trLCB2XV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlKHYsIHVuZGVmaW5lZCwge1xuICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBrZWVwVW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgb25BbmNob3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGxlYXNlIHJlcG9ydCBhIGJ1Zy4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBzb3VyY2VPYmplY3RzOiBuZXcgTWFwKClcbiAgICB9KTtcbn1cbi8vIFR5cGUgZ3VhcmQgaXMgaW50ZW50aW9uYWxseSBhIGxpdHRsZSB3cm9uZyBzbyBhcyB0byBiZSBtb3JlIHVzZWZ1bCxcbi8vIGFzIGl0IGRvZXMgbm90IGNvdmVyIHVudHlwYWJsZSBlbXB0eSBub24tc3RyaW5nIGl0ZXJhYmxlcyAoZS5nLiBbXSkuXG5jb25zdCBpc0VtcHR5UGF0aCA9IChwYXRoKSA9PiBwYXRoID09IG51bGwgfHxcbiAgICAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnICYmICEhcGF0aFtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUpO1xuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIodHlwZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2NoZW1hJywge1xuICAgICAgICAgICAgdmFsdWU6IHNjaGVtYSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNjaGVtYSAtIElmIGRlZmluZWQsIG92ZXJ3cml0ZXMgdGhlIG9yaWdpbmFsJ3Mgc2NoZW1hXG4gICAgICovXG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAoc2NoZW1hKVxuICAgICAgICAgICAgY29weS5zY2hlbWEgPSBzY2hlbWE7XG4gICAgICAgIGNvcHkuaXRlbXMgPSBjb3B5Lml0ZW1zLm1hcChpdCA9PiBpc05vZGUoaXQpIHx8IGlzUGFpcihpdCkgPyBpdC5jbG9uZShzY2hlbWEpIDogaXQpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uIEZvciBgISFtYXBgIGFuZCBgISFvbWFwYCB0aGUgdmFsdWUgbXVzdFxuICAgICAqIGJlIGEgUGFpciBpbnN0YW5jZSBvciBhIGB7IGtleSwgdmFsdWUgfWAgb2JqZWN0LCB3aGljaCBtYXkgbm90IGhhdmUgYSBrZXlcbiAgICAgKiB0aGF0IGFscmVhZHkgZXhpc3RzIGluIHRoZSBtYXAuXG4gICAgICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgdGhpcy5hZGQodmFsdWUpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLmFkZEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZGVsZXRlSW4ocmVzdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihub2RlKSA/IG5vZGUudmFsdWUgOiBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5nZXRJbihyZXN0LCBrZWVwU2NhbGFyKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzQWxsTnVsbFZhbHVlcyhhbGxvd1NjYWxhcikge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5ldmVyeShub2RlID0+IHtcbiAgICAgICAgICAgIGlmICghaXNQYWlyKG5vZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBub2RlLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIChuID09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAoYWxsb3dTY2FsYXIgJiZcbiAgICAgICAgICAgICAgICAgICAgaXNTY2FsYXIobikgJiZcbiAgICAgICAgICAgICAgICAgICAgbi52YWx1ZSA9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICFuLmNvbW1lbnRCZWZvcmUgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICAhbi50YWcpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY29sbGVjdGlvbiBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5oYXNJbihyZXN0KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBjb2xsZWN0aW9uLiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICAgICAgbm9kZS5zZXRJbihyZXN0LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlID09PSB1bmRlZmluZWQgJiYgdGhpcy5zY2hlbWEpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIHJlc3QsIHZhbHVlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgICAgICB9XG4gICAgfVxufVxuQ29sbGVjdGlvbi5tYXhGbG93U3RyaW5nU2luZ2xlTGluZUxlbmd0aCA9IDYwO1xuXG5leHBvcnQgeyBDb2xsZWN0aW9uLCBjb2xsZWN0aW9uRnJvbVBhdGgsIGlzRW1wdHlQYXRoIH07XG4iLCIvKipcbiAqIFN0cmluZ2lmaWVzIGEgY29tbWVudC5cbiAqXG4gKiBFbXB0eSBjb21tZW50IGxpbmVzIGFyZSBsZWZ0IGVtcHR5LFxuICogbGluZXMgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBzcGFjZSBhcmUgcmVwbGFjZWQgYnkgYCNgLFxuICogYW5kIGFsbCBvdGhlciBsaW5lcyBhcmUgcHJlZml4ZWQgd2l0aCBhIGAjYC5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5Q29tbWVudCA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9eKD8hJCkoPzogJCk/L2dtLCAnIycpO1xuZnVuY3Rpb24gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpIHtcbiAgICBpZiAoL15cXG4rJC8udGVzdChjb21tZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQuc3Vic3RyaW5nKDEpO1xuICAgIHJldHVybiBpbmRlbnQgPyBjb21tZW50LnJlcGxhY2UoL14oPyEgKiQpL2dtLCBpbmRlbnQpIDogY29tbWVudDtcbn1cbmNvbnN0IGxpbmVDb21tZW50ID0gKHN0ciwgaW5kZW50LCBjb21tZW50KSA9PiBzdHIuZW5kc1dpdGgoJ1xcbicpXG4gICAgPyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICA6IGNvbW1lbnQuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgID8gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICAgICAgOiAoc3RyLmVuZHNXaXRoKCcgJykgPyAnJyA6ICcgJykgKyBjb21tZW50O1xuXG5leHBvcnQgeyBpbmRlbnRDb21tZW50LCBsaW5lQ29tbWVudCwgc3RyaW5naWZ5Q29tbWVudCB9O1xuIiwiY29uc3QgRk9MRF9GTE9XID0gJ2Zsb3cnO1xuY29uc3QgRk9MRF9CTE9DSyA9ICdibG9jayc7XG5jb25zdCBGT0xEX1FVT1RFRCA9ICdxdW90ZWQnO1xuLyoqXG4gKiBUcmllcyB0byBrZWVwIGlucHV0IGF0IHVwIHRvIGBsaW5lV2lkdGhgIGNoYXJhY3RlcnMsIHNwbGl0dGluZyBvbmx5IG9uIHNwYWNlc1xuICogbm90IGZvbGxvd2VkIGJ5IG5ld2xpbmVzIG9yIHNwYWNlcyB1bmxlc3MgYG1vZGVgIGlzIGAncXVvdGVkJ2AuIExpbmVzIGFyZVxuICogdGVybWluYXRlZCB3aXRoIGBcXG5gIGFuZCBzdGFydGVkIHdpdGggYGluZGVudGAuXG4gKi9cbmZ1bmN0aW9uIGZvbGRGbG93TGluZXModGV4dCwgaW5kZW50LCBtb2RlID0gJ2Zsb3cnLCB7IGluZGVudEF0U3RhcnQsIGxpbmVXaWR0aCA9IDgwLCBtaW5Db250ZW50V2lkdGggPSAyMCwgb25Gb2xkLCBvbk92ZXJmbG93IH0gPSB7fSkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGVuZFN0ZXAgPSBNYXRoLm1heCgxICsgbWluQ29udGVudFdpZHRoLCAxICsgbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGVuZFN0ZXApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGZvbGRzID0gW107XG4gICAgY29uc3QgZXNjYXBlZEZvbGRzID0ge307XG4gICAgbGV0IGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRBdFN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5kZW50QXRTdGFydCA+IGxpbmVXaWR0aCAtIE1hdGgubWF4KDIsIG1pbkNvbnRlbnRXaWR0aCkpXG4gICAgICAgICAgICBmb2xkcy5wdXNoKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnRBdFN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHByZXYgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG92ZXJmbG93ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAtMTtcbiAgICBsZXQgZXNjU3RhcnQgPSAtMTtcbiAgICBsZXQgZXNjRW5kID0gLTE7XG4gICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spIHtcbiAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpKTtcbiAgICAgICAgaWYgKGkgIT09IC0xKVxuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgfVxuICAgIGZvciAobGV0IGNoOyAoY2ggPSB0ZXh0WyhpICs9IDEpXSk7KSB7XG4gICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBlc2NTdGFydCA9IGk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRleHRbaSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gOTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXNjRW5kID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSylcbiAgICAgICAgICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGkpO1xuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnICYmXG4gICAgICAgICAgICAgICAgcHJldiAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXG4nICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJ1xcdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBzcGFjZSBzdXJyb3VuZGVkIGJ5IG5vbi1zcGFjZSBjYW4gYmUgcmVwbGFjZWQgd2l0aCBuZXdsaW5lICsgaW5kZW50XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRleHRbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0ICYmIG5leHQgIT09ICcgJyAmJiBuZXh0ICE9PSAnXFxuJyAmJiBuZXh0ICE9PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPj0gZW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goc3BsaXQpO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzcGxpdCArIGVuZFN0ZXA7XG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGl0ZS1zcGFjZSBjb2xsZWN0ZWQgYXQgZW5kIG1heSBzdHJldGNoIHBhc3QgbGluZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwcmV2ID09PSAnICcgfHwgcHJldiA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoID0gdGV4dFsoaSArPSAxKV07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQWNjb3VudCBmb3IgbmV3bGluZSBlc2NhcGUsIGJ1dCBkb24ndCBicmVhayBwcmVjZWRpbmcgZXNjYXBlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGogPSBpID4gZXNjRW5kICsgMSA/IGkgLSAyIDogZXNjU3RhcnQgLSAxO1xuICAgICAgICAgICAgICAgICAgICAvLyBCYWlsIG91dCBpZiBsaW5lV2lkdGggJiBtaW5Db250ZW50V2lkdGggYXJlIHNob3J0ZXIgdGhhbiBhbiBlc2NhcGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChlc2NhcGVkRm9sZHNbal0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZm9sZHMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgZXNjYXBlZEZvbGRzW2pdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaiArIGVuZFN0ZXA7XG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcmV2ID0gY2g7XG4gICAgfVxuICAgIGlmIChvdmVyZmxvdyAmJiBvbk92ZXJmbG93KVxuICAgICAgICBvbk92ZXJmbG93KCk7XG4gICAgaWYgKGZvbGRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgaWYgKG9uRm9sZClcbiAgICAgICAgb25Gb2xkKCk7XG4gICAgbGV0IHJlcyA9IHRleHQuc2xpY2UoMCwgZm9sZHNbMF0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9sZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZm9sZCA9IGZvbGRzW2ldO1xuICAgICAgICBjb25zdCBlbmQgPSBmb2xkc1tpICsgMV0gfHwgdGV4dC5sZW5ndGg7XG4gICAgICAgIGlmIChmb2xkID09PSAwKVxuICAgICAgICAgICAgcmVzID0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZSgwLCBlbmQpfWA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEICYmIGVzY2FwZWRGb2xkc1tmb2xkXSlcbiAgICAgICAgICAgICAgICByZXMgKz0gYCR7dGV4dFtmb2xkXX1cXFxcYDtcbiAgICAgICAgICAgIHJlcyArPSBgXFxuJHtpbmRlbnR9JHt0ZXh0LnNsaWNlKGZvbGQgKyAxLCBlbmQpfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogUHJlc3VtZXMgYGkgKyAxYCBpcyBhdCB0aGUgc3RhcnQgb2YgYSBsaW5lXG4gKiBAcmV0dXJucyBpbmRleCBvZiBsYXN0IG5ld2xpbmUgaW4gbW9yZS1pbmRlbnRlZCBibG9ja1xuICovXG5mdW5jdGlvbiBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSkge1xuICAgIGxldCBjaCA9IHRleHRbaSArIDFdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaCA9IHRleHRbKGkgKz0gMSldO1xuICAgICAgICB9IHdoaWxlIChjaCAmJiBjaCAhPT0gJ1xcbicpO1xuICAgICAgICBjaCA9IHRleHRbaSArIDFdO1xuICAgIH1cbiAgICByZXR1cm4gaTtcbn1cblxuZXhwb3J0IHsgRk9MRF9CTE9DSywgRk9MRF9GTE9XLCBGT0xEX1FVT1RFRCwgZm9sZEZsb3dMaW5lcyB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IGZvbGRGbG93TGluZXMsIEZPTERfUVVPVEVELCBGT0xEX0ZMT1csIEZPTERfQkxPQ0sgfSBmcm9tICcuL2ZvbGRGbG93TGluZXMuanMnO1xuXG5jb25zdCBnZXRGb2xkT3B0aW9ucyA9IChjdHgsIGlzQmxvY2spID0+ICh7XG4gICAgaW5kZW50QXRTdGFydDogaXNCbG9jayA/IGN0eC5pbmRlbnQubGVuZ3RoIDogY3R4LmluZGVudEF0U3RhcnQsXG4gICAgbGluZVdpZHRoOiBjdHgub3B0aW9ucy5saW5lV2lkdGgsXG4gICAgbWluQ29udGVudFdpZHRoOiBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGhcbn0pO1xuLy8gQWxzbyBjaGVja3MgZm9yIGxpbmVzIHN0YXJ0aW5nIHdpdGggJSwgYXMgcGFyc2luZyB0aGUgb3V0cHV0IGFzIFlBTUwgMS4xIHdpbGxcbi8vIHByZXN1bWUgdGhhdCdzIHN0YXJ0aW5nIGEgbmV3IGRvY3VtZW50LlxuY29uc3QgY29udGFpbnNEb2N1bWVudE1hcmtlciA9IChzdHIpID0+IC9eKCV8LS0tfFxcLlxcLlxcLikvbS50ZXN0KHN0cik7XG5mdW5jdGlvbiBsaW5lTGVuZ3RoT3ZlckxpbWl0KHN0ciwgbGluZVdpZHRoLCBpbmRlbnRMZW5ndGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgbGltaXQgPSBsaW5lV2lkdGggLSBpbmRlbnRMZW5ndGg7XG4gICAgY29uc3Qgc3RyTGVuID0gc3RyLmxlbmd0aDtcbiAgICBpZiAoc3RyTGVuIDw9IGxpbWl0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIHN0YXJ0ID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAoaSAtIHN0YXJ0ID4gbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgaWYgKHN0ckxlbiAtIHN0YXJ0IDw9IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkQXNKU09OKVxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5IH0gPSBjdHg7XG4gICAgY29uc3QgbWluTXVsdGlMaW5lTGVuZ3RoID0gY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMCwgY2ggPSBqc29uW2ldOyBjaDsgY2ggPSBqc29uWysraV0pIHtcbiAgICAgICAgaWYgKGNoID09PSAnICcgJiYganNvbltpICsgMV0gPT09ICdcXFxcJyAmJiBqc29uW2kgKyAyXSA9PT0gJ24nKSB7XG4gICAgICAgICAgICAvLyBzcGFjZSBiZWZvcmUgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKSArICdcXFxcICc7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICBjaCA9ICdcXFxcJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXFxcJylcbiAgICAgICAgICAgIHN3aXRjaCAoanNvbltpICsgMV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGpzb24uc3Vic3RyKGkgKyAyLCA0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFwwJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwNyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXGEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDBiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcdic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMWInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDA4NSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXE4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMGEwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcXyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxMJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjAyOSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXFAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZS5zdWJzdHIoMCwgMikgPT09ICcwMCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFx4JyArIGNvZGUuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zdWJzdHIoaSwgNik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDJdID09PSAnXCInIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLmxlbmd0aCA8IG1pbk11bHRpTGluZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9sZGluZyB3aWxsIGVhdCBmaXJzdCBuZXdsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqc29uW2kgKyAyXSA9PT0gJ1xcXFwnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgM10gPT09ICduJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDRdICE9PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbmRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzcGFjZSBhZnRlciBuZXdsaW5lIG5lZWRzIHRvIGJlIGVzY2FwZWQgdG8gbm90IGJlIGZvbGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25baSArIDJdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgIH1cbiAgICBzdHIgPSBzdGFydCA/IHN0ciArIGpzb24uc2xpY2Uoc3RhcnQpIDoganNvbjtcbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzKHN0ciwgaW5kZW50LCBGT0xEX1FVT1RFRCwgZ2V0Rm9sZE9wdGlvbnMoY3R4LCBmYWxzZSkpO1xufVxuZnVuY3Rpb24gc2luZ2xlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpIHtcbiAgICBpZiAoY3R4Lm9wdGlvbnMuc2luZ2xlUXVvdGUgPT09IGZhbHNlIHx8XG4gICAgICAgIChjdHguaW1wbGljaXRLZXkgJiYgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB8fFxuICAgICAgICAvWyBcXHRdXFxufFxcblsgXFx0XS8udGVzdCh2YWx1ZSkgLy8gc2luZ2xlIHF1b3RlZCBzdHJpbmcgY2FuJ3QgaGF2ZSBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UgYXJvdW5kIG5ld2xpbmVcbiAgICApXG4gICAgICAgIHJldHVybiBkb3VibGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgY29uc3QgaW5kZW50ID0gY3R4LmluZGVudCB8fCAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkgPyAnICAnIDogJycpO1xuICAgIGNvbnN0IHJlcyA9IFwiJ1wiICsgdmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpLnJlcGxhY2UoL1xcbisvZywgYCQmXFxuJHtpbmRlbnR9YCkgKyBcIidcIjtcbiAgICByZXR1cm4gY3R4LmltcGxpY2l0S2V5XG4gICAgICAgID8gcmVzXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcyhyZXMsIGluZGVudCwgRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IHsgc2luZ2xlUXVvdGUgfSA9IGN0eC5vcHRpb25zO1xuICAgIGxldCBxcztcbiAgICBpZiAoc2luZ2xlUXVvdGUgPT09IGZhbHNlKVxuICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgaGFzRG91YmxlID0gdmFsdWUuaW5jbHVkZXMoJ1wiJyk7XG4gICAgICAgIGNvbnN0IGhhc1NpbmdsZSA9IHZhbHVlLmluY2x1ZGVzKFwiJ1wiKTtcbiAgICAgICAgaWYgKGhhc0RvdWJsZSAmJiAhaGFzU2luZ2xlKVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2UgaWYgKGhhc1NpbmdsZSAmJiAhaGFzRG91YmxlKVxuICAgICAgICAgICAgcXMgPSBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHFzID0gc2luZ2xlUXVvdGUgPyBzaW5nbGVRdW90ZWRTdHJpbmcgOiBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiBxcyh2YWx1ZSwgY3R4KTtcbn1cbi8vIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGF2b2lkcyBhIHBvbHlub21pYWwgc2VhcmNoLFxuLy8gYnV0IGlzbid0IHN1cHBvcnRlZCB5ZXQgb24gU2FmYXJpOiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG5sZXQgYmxvY2tFbmROZXdsaW5lcztcbnRyeSB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IG5ldyBSZWdFeHAoJyhefCg/PCFcXG4pKVxcbisoPyFcXG58JCknLCAnZycpO1xufVxuY2F0Y2gge1xuICAgIGJsb2NrRW5kTmV3bGluZXMgPSAvXFxuKyg/IVxcbnwkKS9nO1xufVxuZnVuY3Rpb24gYmxvY2tTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGJsb2NrUXVvdGUsIGNvbW1lbnRTdHJpbmcsIGxpbmVXaWR0aCB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgLy8gMS4gQmxvY2sgY2FuJ3QgZW5kIGluIHdoaXRlc3BhY2UgdW5sZXNzIHRoZSBsYXN0IGxpbmUgaXMgbm9uLWVtcHR5LlxuICAgIC8vIDIuIFN0cmluZ3MgY29uc2lzdGluZyBvZiBvbmx5IHdoaXRlc3BhY2UgYXJlIGJlc3QgcmVuZGVyZWQgZXhwbGljaXRseS5cbiAgICBpZiAoIWJsb2NrUXVvdGUgfHwgL1xcbltcXHQgXSskLy50ZXN0KHZhbHVlKSB8fCAvXlxccyokLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8XG4gICAgICAgIChjdHguZm9yY2VCbG9ja0luZGVudCB8fCBjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgbGl0ZXJhbCA9IGJsb2NrUXVvdGUgPT09ICdsaXRlcmFsJ1xuICAgICAgICA/IHRydWVcbiAgICAgICAgOiBibG9ja1F1b3RlID09PSAnZm9sZGVkJyB8fCB0eXBlID09PSBTY2FsYXIuQkxPQ0tfRk9MREVEXG4gICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICA6IHR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMXG4gICAgICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICAgICAgOiAhbGluZUxlbmd0aE92ZXJMaW1pdCh2YWx1ZSwgbGluZVdpZHRoLCBpbmRlbnQubGVuZ3RoKTtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gbGl0ZXJhbCA/ICd8XFxuJyA6ICc+XFxuJztcbiAgICAvLyBkZXRlcm1pbmUgY2hvbXBpbmcgZnJvbSB3aGl0ZXNwYWNlIGF0IHZhbHVlIGVuZFxuICAgIGxldCBjaG9tcDtcbiAgICBsZXQgZW5kU3RhcnQ7XG4gICAgZm9yIChlbmRTdGFydCA9IHZhbHVlLmxlbmd0aDsgZW5kU3RhcnQgPiAwOyAtLWVuZFN0YXJ0KSB7XG4gICAgICAgIGNvbnN0IGNoID0gdmFsdWVbZW5kU3RhcnQgLSAxXTtcbiAgICAgICAgaWYgKGNoICE9PSAnXFxuJyAmJiBjaCAhPT0gJ1xcdCcgJiYgY2ggIT09ICcgJylcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgZW5kID0gdmFsdWUuc3Vic3RyaW5nKGVuZFN0YXJ0KTtcbiAgICBjb25zdCBlbmRObFBvcyA9IGVuZC5pbmRleE9mKCdcXG4nKTtcbiAgICBpZiAoZW5kTmxQb3MgPT09IC0xKSB7XG4gICAgICAgIGNob21wID0gJy0nOyAvLyBzdHJpcFxuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZSA9PT0gZW5kIHx8IGVuZE5sUG9zICE9PSBlbmQubGVuZ3RoIC0gMSkge1xuICAgICAgICBjaG9tcCA9ICcrJzsgLy8ga2VlcFxuICAgICAgICBpZiAob25DaG9tcEtlZXApXG4gICAgICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY2hvbXAgPSAnJzsgLy8gY2xpcFxuICAgIH1cbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMCwgLWVuZC5sZW5ndGgpO1xuICAgICAgICBpZiAoZW5kW2VuZC5sZW5ndGggLSAxXSA9PT0gJ1xcbicpXG4gICAgICAgICAgICBlbmQgPSBlbmQuc2xpY2UoMCwgLTEpO1xuICAgICAgICBlbmQgPSBlbmQucmVwbGFjZShibG9ja0VuZE5ld2xpbmVzLCBgJCYke2luZGVudH1gKTtcbiAgICB9XG4gICAgLy8gZGV0ZXJtaW5lIGluZGVudCBpbmRpY2F0b3IgZnJvbSB3aGl0ZXNwYWNlIGF0IHZhbHVlIHN0YXJ0XG4gICAgbGV0IHN0YXJ0V2l0aFNwYWNlID0gZmFsc2U7XG4gICAgbGV0IHN0YXJ0RW5kO1xuICAgIGxldCBzdGFydE5sUG9zID0gLTE7XG4gICAgZm9yIChzdGFydEVuZCA9IDA7IHN0YXJ0RW5kIDwgdmFsdWUubGVuZ3RoOyArK3N0YXJ0RW5kKSB7XG4gICAgICAgIGNvbnN0IGNoID0gdmFsdWVbc3RhcnRFbmRdO1xuICAgICAgICBpZiAoY2ggPT09ICcgJylcbiAgICAgICAgICAgIHN0YXJ0V2l0aFNwYWNlID0gdHJ1ZTtcbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgc3RhcnRObFBvcyA9IHN0YXJ0RW5kO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IHN0YXJ0ID0gdmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0TmxQb3MgPCBzdGFydEVuZCA/IHN0YXJ0TmxQb3MgKyAxIDogc3RhcnRFbmQpO1xuICAgIGlmIChzdGFydCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyhzdGFydC5sZW5ndGgpO1xuICAgICAgICBzdGFydCA9IHN0YXJ0LnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGVudFNpemUgPSBpbmRlbnQgPyAnMicgOiAnMSc7IC8vIHJvb3QgaXMgYXQgLTFcbiAgICBsZXQgaGVhZGVyID0gKGxpdGVyYWwgPyAnfCcgOiAnPicpICsgKHN0YXJ0V2l0aFNwYWNlID8gaW5kZW50U2l6ZSA6ICcnKSArIGNob21wO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGhlYWRlciArPSAnICcgKyBjb21tZW50U3RyaW5nKGNvbW1lbnQucmVwbGFjZSgvID9bXFxyXFxuXSsvZywgJyAnKSk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKGxpdGVyYWwpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgICAgICByZXR1cm4gYCR7aGVhZGVyfVxcbiR7aW5kZW50fSR7c3RhcnR9JHt2YWx1ZX0ke2VuZH1gO1xuICAgIH1cbiAgICB2YWx1ZSA9IHZhbHVlXG4gICAgICAgIC5yZXBsYWNlKC9cXG4rL2csICdcXG4kJicpXG4gICAgICAgIC5yZXBsYWNlKC8oPzpefFxcbikoW1xcdCBdLiopKD86KFtcXG5cXHQgXSopXFxuKD8hW1xcblxcdCBdKSk/L2csICckMSQyJykgLy8gbW9yZS1pbmRlbnRlZCBsaW5lcyBhcmVuJ3QgZm9sZGVkXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIF4gbW9yZS1pbmQuIF4gZW1wdHkgICAgIF4gY2FwdHVyZSBuZXh0IGVtcHR5IGxpbmVzIG9ubHkgYXQgZW5kIG9mIGluZGVudFxuICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICBjb25zdCBib2R5ID0gZm9sZEZsb3dMaW5lcyhgJHtzdGFydH0ke3ZhbHVlfSR7ZW5kfWAsIGluZGVudCwgRk9MRF9CTE9DSywgZ2V0Rm9sZE9wdGlvbnMoY3R4LCB0cnVlKSk7XG4gICAgcmV0dXJuIGAke2hlYWRlcn1cXG4ke2luZGVudH0ke2JvZHl9YDtcbn1cbmZ1bmN0aW9uIHBsYWluU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgdHlwZSwgdmFsdWUgfSA9IGl0ZW07XG4gICAgY29uc3QgeyBhY3R1YWxTdHJpbmcsIGltcGxpY2l0S2V5LCBpbmRlbnQsIGluZGVudFN0ZXAsIGluRmxvdyB9ID0gY3R4O1xuICAgIGlmICgoaW1wbGljaXRLZXkgJiYgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB8fFxuICAgICAgICAoaW5GbG93ICYmIC9bW1xcXXt9LF0vLnRlc3QodmFsdWUpKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlIHx8XG4gICAgICAgIC9eW1xcblxcdCAsW1xcXXt9IyYqIXw+J1wiJUBgXXxeWz8tXSR8Xls/LV1bIFxcdF18W1xcbjpdWyBcXHRdfFsgXFx0XVxcbnxbXFxuXFx0IF0jfFtcXG5cXHQgOl0kLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAvLyBub3QgYWxsb3dlZDpcbiAgICAgICAgLy8gLSBlbXB0eSBzdHJpbmcsICctJyBvciAnPydcbiAgICAgICAgLy8gLSBzdGFydCB3aXRoIGFuIGluZGljYXRvciBjaGFyYWN0ZXIgKGV4Y2VwdCBbPzotXSkgb3IgL1s/LV0gL1xuICAgICAgICAvLyAtICdcXG4gJywgJzogJyBvciAnIFxcbicgYW55d2hlcmVcbiAgICAgICAgLy8gLSAnIycgbm90IHByZWNlZGVkIGJ5IGEgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgLy8gLSBlbmQgd2l0aCAnICcgb3IgJzonXG4gICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3cgfHwgIXZhbHVlLmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKCFpbXBsaWNpdEtleSAmJlxuICAgICAgICAhaW5GbG93ICYmXG4gICAgICAgIHR5cGUgIT09IFNjYWxhci5QTEFJTiAmJlxuICAgICAgICB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgLy8gV2hlcmUgYWxsb3dlZCAmIHR5cGUgbm90IHNldCBleHBsaWNpdGx5LCBwcmVmZXIgYmxvY2sgc3R5bGUgZm9yIG11bHRpbGluZSBzdHJpbmdzXG4gICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGluZGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGltcGxpY2l0S2V5ICYmIGluZGVudCA9PT0gaW5kZW50U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdHIgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApO1xuICAgIC8vIFZlcmlmeSB0aGF0IG91dHB1dCB3aWxsIGJlIHBhcnNlZCBhcyBhIHN0cmluZywgYXMgZS5nLiBwbGFpbiBudW1iZXJzIGFuZFxuICAgIC8vIGJvb2xlYW5zIGdldCBwYXJzZWQgd2l0aCB0aG9zZSB0eXBlcyBpbiB2MS4yIChlLmcuICc0MicsICd0cnVlJyAmICcwLjllLTMnKSxcbiAgICAvLyBhbmQgb3RoZXJzIGluIHYxLjEuXG4gICAgaWYgKGFjdHVhbFN0cmluZykge1xuICAgICAgICBjb25zdCB0ZXN0ID0gKHRhZykgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicgJiYgdGFnLnRlc3Q/LnRlc3Qoc3RyKTtcbiAgICAgICAgY29uc3QgeyBjb21wYXQsIHRhZ3MgfSA9IGN0eC5kb2Muc2NoZW1hO1xuICAgICAgICBpZiAodGFncy5zb21lKHRlc3QpIHx8IGNvbXBhdD8uc29tZSh0ZXN0KSlcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIEZPTERfRkxPVywgZ2V0Rm9sZE9wdGlvbnMoY3R4LCBmYWxzZSkpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5U3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXksIGluRmxvdyB9ID0gY3R4O1xuICAgIGNvbnN0IHNzID0gdHlwZW9mIGl0ZW0udmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgID8gaXRlbVxuICAgICAgICA6IE9iamVjdC5hc3NpZ24oe30sIGl0ZW0sIHsgdmFsdWU6IFN0cmluZyhpdGVtLnZhbHVlKSB9KTtcbiAgICBsZXQgeyB0eXBlIH0gPSBpdGVtO1xuICAgIGlmICh0eXBlICE9PSBTY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgIC8vIGZvcmNlIGRvdWJsZSBxdW90ZXMgb24gY29udHJvbCBjaGFyYWN0ZXJzICYgdW5wYWlyZWQgc3Vycm9nYXRlc1xuICAgICAgICBpZiAoL1tcXHgwMC1cXHgwOFxceDBiLVxceDFmXFx4N2YtXFx4OWZcXHV7RDgwMH0tXFx1e0RGRkZ9XS91LnRlc3Qoc3MudmFsdWUpKVxuICAgICAgICAgICAgdHlwZSA9IFNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgfVxuICAgIGNvbnN0IF9zdHJpbmdpZnkgPSAoX3R5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuQkxPQ0tfRk9MREVEOlxuICAgICAgICAgICAgY2FzZSBTY2FsYXIuQkxPQ0tfTElURVJBTDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93XG4gICAgICAgICAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpIC8vIGJsb2NrcyBhcmUgbm90IHZhbGlkIGluc2lkZSBmbG93IGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgOiBibG9ja1N0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlFVT1RFX0RPVUJMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuUVVPVEVfU0lOR0xFOlxuICAgICAgICAgICAgICAgIHJldHVybiBzaW5nbGVRdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCk7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5QTEFJTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxhaW5TdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsZXQgcmVzID0gX3N0cmluZ2lmeSh0eXBlKTtcbiAgICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdEtleVR5cGUsIGRlZmF1bHRTdHJpbmdUeXBlIH0gPSBjdHgub3B0aW9ucztcbiAgICAgICAgY29uc3QgdCA9IChpbXBsaWNpdEtleSAmJiBkZWZhdWx0S2V5VHlwZSkgfHwgZGVmYXVsdFN0cmluZ1R5cGU7XG4gICAgICAgIHJlcyA9IF9zdHJpbmdpZnkodCk7XG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRlZmF1bHQgc3RyaW5nIHR5cGUgJHt0fWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfTtcbiIsImltcG9ydCB7IGFuY2hvcklzVmFsaWQgfSBmcm9tICcuLi9kb2MvYW5jaG9ycy5qcyc7XG5pbXBvcnQgeyBpc1BhaXIsIGlzQWxpYXMsIGlzTm9kZSwgaXNTY2FsYXIsIGlzQ29sbGVjdGlvbiB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeUNvbW1lbnQgfSBmcm9tICcuL3N0cmluZ2lmeUNvbW1lbnQuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi9zdHJpbmdpZnlTdHJpbmcuanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucykge1xuICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBibG9ja1F1b3RlOiB0cnVlLFxuICAgICAgICBjb21tZW50U3RyaW5nOiBzdHJpbmdpZnlDb21tZW50LFxuICAgICAgICBkZWZhdWx0S2V5VHlwZTogbnVsbCxcbiAgICAgICAgZGVmYXVsdFN0cmluZ1R5cGU6ICdQTEFJTicsXG4gICAgICAgIGRpcmVjdGl2ZXM6IG51bGwsXG4gICAgICAgIGRvdWJsZVF1b3RlZEFzSlNPTjogZmFsc2UsXG4gICAgICAgIGRvdWJsZVF1b3RlZE1pbk11bHRpTGluZUxlbmd0aDogNDAsXG4gICAgICAgIGZhbHNlU3RyOiAnZmFsc2UnLFxuICAgICAgICBmbG93Q29sbGVjdGlvblBhZGRpbmc6IHRydWUsXG4gICAgICAgIGluZGVudFNlcTogdHJ1ZSxcbiAgICAgICAgbGluZVdpZHRoOiA4MCxcbiAgICAgICAgbWluQ29udGVudFdpZHRoOiAyMCxcbiAgICAgICAgbnVsbFN0cjogJ251bGwnLFxuICAgICAgICBzaW1wbGVLZXlzOiBmYWxzZSxcbiAgICAgICAgc2luZ2xlUXVvdGU6IG51bGwsXG4gICAgICAgIHRydWVTdHI6ICd0cnVlJyxcbiAgICAgICAgdmVyaWZ5QWxpYXNPcmRlcjogdHJ1ZVxuICAgIH0sIGRvYy5zY2hlbWEudG9TdHJpbmdPcHRpb25zLCBvcHRpb25zKTtcbiAgICBsZXQgaW5GbG93O1xuICAgIHN3aXRjaCAob3B0LmNvbGxlY3Rpb25TdHlsZSkge1xuICAgICAgICBjYXNlICdibG9jayc6XG4gICAgICAgICAgICBpbkZsb3cgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgIGluRmxvdyA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGluRmxvdyA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGFuY2hvcnM6IG5ldyBTZXQoKSxcbiAgICAgICAgZG9jLFxuICAgICAgICBmbG93Q29sbGVjdGlvblBhZGRpbmc6IG9wdC5mbG93Q29sbGVjdGlvblBhZGRpbmcgPyAnICcgOiAnJyxcbiAgICAgICAgaW5kZW50OiAnJyxcbiAgICAgICAgaW5kZW50U3RlcDogdHlwZW9mIG9wdC5pbmRlbnQgPT09ICdudW1iZXInID8gJyAnLnJlcGVhdChvcHQuaW5kZW50KSA6ICcgICcsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogb3B0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldFRhZ09iamVjdCh0YWdzLCBpdGVtKSB7XG4gICAgaWYgKGl0ZW0udGFnKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gaXRlbS50YWcpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJldHVybiBtYXRjaC5maW5kKHQgPT4gdC5mb3JtYXQgPT09IGl0ZW0uZm9ybWF0KSA/PyBtYXRjaFswXTtcbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgb2JqO1xuICAgIGlmIChpc1NjYWxhcihpdGVtKSkge1xuICAgICAgICBvYmogPSBpdGVtLnZhbHVlO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC5pZGVudGlmeT8uKG9iaikpO1xuICAgICAgICB0YWdPYmogPVxuICAgICAgICAgICAgbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvYmogPSBpdGVtO1xuICAgICAgICB0YWdPYmogPSB0YWdzLmZpbmQodCA9PiB0Lm5vZGVDbGFzcyAmJiBvYmogaW5zdGFuY2VvZiB0Lm5vZGVDbGFzcyk7XG4gICAgfVxuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBvYmo/LmNvbnN0cnVjdG9yPy5uYW1lID8/IHR5cGVvZiBvYmo7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnIG5vdCByZXNvbHZlZCBmb3IgJHtuYW1lfSB2YWx1ZWApO1xuICAgIH1cbiAgICByZXR1cm4gdGFnT2JqO1xufVxuLy8gbmVlZHMgdG8gYmUgY2FsbGVkIGJlZm9yZSB2YWx1ZSBzdHJpbmdpZmllciB0byBhbGxvdyBmb3IgY2lyY3VsYXIgYW5jaG9yIHJlZnNcbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgeyBhbmNob3JzLCBkb2MgfSkge1xuICAgIGlmICghZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBjb25zdCBwcm9wcyA9IFtdO1xuICAgIGNvbnN0IGFuY2hvciA9IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmIG5vZGUuYW5jaG9yO1xuICAgIGlmIChhbmNob3IgJiYgYW5jaG9ySXNWYWxpZChhbmNob3IpKSB7XG4gICAgICAgIGFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgIHByb3BzLnB1c2goYCYke2FuY2hvcn1gKTtcbiAgICB9XG4gICAgY29uc3QgdGFnID0gbm9kZS50YWcgPyBub2RlLnRhZyA6IHRhZ09iai5kZWZhdWx0ID8gbnVsbCA6IHRhZ09iai50YWc7XG4gICAgaWYgKHRhZylcbiAgICAgICAgcHJvcHMucHVzaChkb2MuZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnKSk7XG4gICAgcmV0dXJuIHByb3BzLmpvaW4oJyAnKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBpZiAoaXNQYWlyKGl0ZW0pKVxuICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmIChpc0FsaWFzKGl0ZW0pKSB7XG4gICAgICAgIGlmIChjdHguZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgpO1xuICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcz8uaGFzKGl0ZW0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc3RyaW5naWZ5IGNpcmN1bGFyIHN0cnVjdHVyZSB3aXRob3V0IGFsaWFzIG5vZGVzYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcylcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzLmFkZChpdGVtKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzID0gbmV3IFNldChbaXRlbV0pO1xuICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucmVzb2x2ZShjdHguZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5vZGUgPSBpc05vZGUoaXRlbSlcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogY3R4LmRvYy5jcmVhdGVOb2RlKGl0ZW0sIHsgb25UYWdPYmo6IG8gPT4gKHRhZ09iaiA9IG8pIH0pO1xuICAgIGlmICghdGFnT2JqKVxuICAgICAgICB0YWdPYmogPSBnZXRUYWdPYmplY3QoY3R4LmRvYy5zY2hlbWEudGFncywgbm9kZSk7XG4gICAgY29uc3QgcHJvcHMgPSBzdHJpbmdpZnlQcm9wcyhub2RlLCB0YWdPYmosIGN0eCk7XG4gICAgaWYgKHByb3BzLmxlbmd0aCA+IDApXG4gICAgICAgIGN0eC5pbmRlbnRBdFN0YXJ0ID0gKGN0eC5pbmRlbnRBdFN0YXJ0ID8/IDApICsgcHJvcHMubGVuZ3RoICsgMTtcbiAgICBjb25zdCBzdHIgPSB0eXBlb2YgdGFnT2JqLnN0cmluZ2lmeSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRhZ09iai5zdHJpbmdpZnkobm9kZSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICA6IGlzU2NhbGFyKG5vZGUpXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVN0cmluZyhub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IG5vZGUudG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoIXByb3BzKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIHJldHVybiBpc1NjYWxhcihub2RlKSB8fCBzdHJbMF0gPT09ICd7JyB8fCBzdHJbMF0gPT09ICdbJ1xuICAgICAgICA/IGAke3Byb3BzfSAke3N0cn1gXG4gICAgICAgIDogYCR7cHJvcHN9XFxuJHtjdHguaW5kZW50fSR7c3RyfWA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQsIHN0cmluZ2lmeSB9O1xuIiwiaW1wb3J0IHsgaXNDb2xsZWN0aW9uLCBpc05vZGUsIGlzU2NhbGFyLCBpc1NlcSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5pbXBvcnQgeyBsaW5lQ29tbWVudCwgaW5kZW50Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVBhaXIoeyBrZXksIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYWxsTnVsbFZhbHVlcywgZG9jLCBpbmRlbnQsIGluZGVudFN0ZXAsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZywgaW5kZW50U2VxLCBzaW1wbGVLZXlzIH0gfSA9IGN0eDtcbiAgICBsZXQga2V5Q29tbWVudCA9IChpc05vZGUoa2V5KSAmJiBrZXkuY29tbWVudCkgfHwgbnVsbDtcbiAgICBpZiAoc2ltcGxlS2V5cykge1xuICAgICAgICBpZiAoa2V5Q29tbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBrZXkgbm9kZXMgY2Fubm90IGhhdmUgY29tbWVudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKGtleSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHNpbXBsZSBrZXlzLCBjb2xsZWN0aW9uIGNhbm5vdCBiZSB1c2VkIGFzIGEga2V5IHZhbHVlJztcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBleHBsaWNpdEtleSA9ICFzaW1wbGVLZXlzICYmXG4gICAgICAgICgha2V5IHx8XG4gICAgICAgICAgICAoa2V5Q29tbWVudCAmJiB2YWx1ZSA9PSBudWxsICYmICFjdHguaW5GbG93KSB8fFxuICAgICAgICAgICAgaXNDb2xsZWN0aW9uKGtleSkgfHxcbiAgICAgICAgICAgIChpc1NjYWxhcihrZXkpXG4gICAgICAgICAgICAgICAgPyBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0ZPTERFRCB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA6IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSk7XG4gICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGFsbE51bGxWYWx1ZXM6IGZhbHNlLFxuICAgICAgICBpbXBsaWNpdEtleTogIWV4cGxpY2l0S2V5ICYmIChzaW1wbGVLZXlzIHx8ICFhbGxOdWxsVmFsdWVzKSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgKyBpbmRlbnRTdGVwXG4gICAgfSk7XG4gICAgbGV0IGtleUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoa2V5LCBjdHgsICgpID0+IChrZXlDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWN0eC5pbkZsb3cgJiYgc3RyLmxlbmd0aCA+IDEwMjQpIHtcbiAgICAgICAgaWYgKHNpbXBsZUtleXMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIHNpbmdsZSBsaW5lIHNjYWxhciBtdXN0IG5vdCBzcGFuIG1vcmUgdGhhbiAxMDI0IGNoYXJhY3RlcnMnKTtcbiAgICAgICAgZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAoYWxsTnVsbFZhbHVlcyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoa2V5Q29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJycgPyAnPycgOiBleHBsaWNpdEtleSA/IGA/ICR7c3RyfWAgOiBzdHI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoKGFsbE51bGxWYWx1ZXMgJiYgIXNpbXBsZUtleXMpIHx8ICh2YWx1ZSA9PSBudWxsICYmIGV4cGxpY2l0S2V5KSkge1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1gO1xuICAgICAgICBpZiAoa2V5Q29tbWVudCAmJiAha2V5Q29tbWVudERvbmUpIHtcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIGlmIChrZXlDb21tZW50RG9uZSlcbiAgICAgICAga2V5Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGV4cGxpY2l0S2V5KSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfVxcbiR7aW5kZW50fTpgO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gYCR7c3RyfTpgO1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgIH1cbiAgICBsZXQgdnNiLCB2Y2IsIHZhbHVlQ29tbWVudDtcbiAgICBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgICAgICB2c2IgPSAhIXZhbHVlLnNwYWNlQmVmb3JlO1xuICAgICAgICB2Y2IgPSB2YWx1ZS5jb21tZW50QmVmb3JlO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSB2YWx1ZS5jb21tZW50O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdnNiID0gZmFsc2U7XG4gICAgICAgIHZjYiA9IG51bGw7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgdmFsdWUgPSBkb2MuY3JlYXRlTm9kZSh2YWx1ZSk7XG4gICAgfVxuICAgIGN0eC5pbXBsaWNpdEtleSA9IGZhbHNlO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWtleUNvbW1lbnQgJiYgaXNTY2FsYXIodmFsdWUpKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IHN0ci5sZW5ndGggKyAxO1xuICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGlmICghaW5kZW50U2VxICYmXG4gICAgICAgIGluZGVudFN0ZXAubGVuZ3RoID49IDIgJiZcbiAgICAgICAgIWN0eC5pbkZsb3cgJiZcbiAgICAgICAgIWV4cGxpY2l0S2V5ICYmXG4gICAgICAgIGlzU2VxKHZhbHVlKSAmJlxuICAgICAgICAhdmFsdWUuZmxvdyAmJlxuICAgICAgICAhdmFsdWUudGFnICYmXG4gICAgICAgICF2YWx1ZS5hbmNob3IpIHtcbiAgICAgICAgLy8gSWYgaW5kZW50U2VxID09PSBmYWxzZSwgY29uc2lkZXIgJy0gJyBhcyBwYXJ0IG9mIGluZGVudGF0aW9uIHdoZXJlIHBvc3NpYmxlXG4gICAgICAgIGN0eC5pbmRlbnQgPSBjdHguaW5kZW50LnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgbGV0IHZhbHVlQ29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBjb25zdCB2YWx1ZVN0ciA9IHN0cmluZ2lmeSh2YWx1ZSwgY3R4LCAoKSA9PiAodmFsdWVDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGxldCB3cyA9ICcgJztcbiAgICBpZiAoa2V5Q29tbWVudCB8fCB2c2IgfHwgdmNiKSB7XG4gICAgICAgIHdzID0gdnNiID8gJ1xcbicgOiAnJztcbiAgICAgICAgaWYgKHZjYikge1xuICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKHZjYik7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtpbmRlbnRDb21tZW50KGNzLCBjdHguaW5kZW50KX1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVN0ciA9PT0gJycgJiYgIWN0eC5pbkZsb3cpIHtcbiAgICAgICAgICAgIGlmICh3cyA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgd3MgPSAnXFxuXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICghZXhwbGljaXRLZXkgJiYgaXNDb2xsZWN0aW9uKHZhbHVlKSkge1xuICAgICAgICBjb25zdCB2czAgPSB2YWx1ZVN0clswXTtcbiAgICAgICAgY29uc3QgbmwwID0gdmFsdWVTdHIuaW5kZXhPZignXFxuJyk7XG4gICAgICAgIGNvbnN0IGhhc05ld2xpbmUgPSBubDAgIT09IC0xO1xuICAgICAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyB2YWx1ZS5mbG93ID8/IHZhbHVlLml0ZW1zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGhhc05ld2xpbmUgfHwgIWZsb3cpIHtcbiAgICAgICAgICAgIGxldCBoYXNQcm9wc0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChoYXNOZXdsaW5lICYmICh2czAgPT09ICcmJyB8fCB2czAgPT09ICchJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcpO1xuICAgICAgICAgICAgICAgIGlmICh2czAgPT09ICcmJyAmJlxuICAgICAgICAgICAgICAgICAgICBzcDAgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCA8IG5sMCAmJlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cltzcDAgKyAxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwMCA9IHZhbHVlU3RyLmluZGV4T2YoJyAnLCBzcDAgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwMCA9PT0gLTEgfHwgbmwwIDwgc3AwKVxuICAgICAgICAgICAgICAgICAgICBoYXNQcm9wc0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wc0xpbmUpXG4gICAgICAgICAgICAgICAgd3MgPSBgXFxuJHtjdHguaW5kZW50fWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVTdHIgPT09ICcnIHx8IHZhbHVlU3RyWzBdID09PSAnXFxuJykge1xuICAgICAgICB3cyA9ICcnO1xuICAgIH1cbiAgICBzdHIgKz0gd3MgKyB2YWx1ZVN0cjtcbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAodmFsdWVDb21tZW50RG9uZSAmJiBvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVDb21tZW50ICYmICF2YWx1ZUNvbW1lbnREb25lKSB7XG4gICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcodmFsdWVDb21tZW50KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcCkge1xuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlQYWlyIH07XG4iLCJmdW5jdGlvbiBkZWJ1Zyhsb2dMZXZlbCwgLi4ubWVzc2FnZXMpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLm1lc3NhZ2VzKTtcbn1cbmZ1bmN0aW9uIHdhcm4obG9nTGV2ZWwsIHdhcm5pbmcpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycgfHwgbG9nTGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdHlwZXNjcmlwdC1lc2xpbnQvdHlwZXNjcmlwdC1lc2xpbnQvaXNzdWVzLzc0NzhcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItb3B0aW9uYWwtY2hhaW5cbiAgICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVtaXRXYXJuaW5nKVxuICAgICAgICAgICAgcHJvY2Vzcy5lbWl0V2FybmluZyh3YXJuaW5nKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgZGVidWcsIHdhcm4gfTtcbiIsImltcG9ydCB7IHdhcm4gfSBmcm9tICcuLi9sb2cuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgaXNBbGlhcywgaXNTZXEsIGlzU2NhbGFyLCBpc01hcCwgaXNOb2RlIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuL1NjYWxhci5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY29uc3QgTUVSR0VfS0VZID0gJzw8JztcbmZ1bmN0aW9uIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCB7IGtleSwgdmFsdWUgfSkge1xuICAgIGlmIChjdHg/LmRvYy5zY2hlbWEubWVyZ2UgJiYgaXNNZXJnZUtleShrZXkpKSB7XG4gICAgICAgIHZhbHVlID0gaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MpIDogdmFsdWU7XG4gICAgICAgIGlmIChpc1NlcSh2YWx1ZSkpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHZhbHVlLml0ZW1zKVxuICAgICAgICAgICAgICAgIG1lcmdlVG9KU01hcChjdHgsIG1hcCwgaXQpO1xuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2YgdmFsdWUpXG4gICAgICAgICAgICAgICAgbWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCBpdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lcmdlVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QganNLZXkgPSB0b0pTKGtleSwgJycsIGN0eCk7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIG1hcC5zZXQoanNLZXksIHRvSlModmFsdWUsIGpzS2V5LCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoanNLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gc3RyaW5naWZ5S2V5KGtleSwganNLZXksIGN0eCk7XG4gICAgICAgICAgICBjb25zdCBqc1ZhbHVlID0gdG9KUyh2YWx1ZSwgc3RyaW5nS2V5LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHN0cmluZ0tleSBpbiBtYXApXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgc3RyaW5nS2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBqc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFwW3N0cmluZ0tleV0gPSBqc1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5jb25zdCBpc01lcmdlS2V5ID0gKGtleSkgPT4ga2V5ID09PSBNRVJHRV9LRVkgfHxcbiAgICAoaXNTY2FsYXIoa2V5KSAmJlxuICAgICAgICBrZXkudmFsdWUgPT09IE1FUkdFX0tFWSAmJlxuICAgICAgICAoIWtleS50eXBlIHx8IGtleS50eXBlID09PSBTY2FsYXIuUExBSU4pKTtcbi8vIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBtZXJnZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mXG4vLyBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXlcbi8vIGFscmVhZHkgZXhpc3RzIGluIGl0LiBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXJnZSBrZXkgaXMgYVxuLy8gc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXMgYW5kIGVhY2hcbi8vIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLlxuLy8gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXIgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluXG4vLyBsYXRlciBtYXBwaW5nIG5vZGVzLiAtLSBodHRwOi8veWFtbC5vcmcvdHlwZS9tZXJnZS5odG1sXG5mdW5jdGlvbiBtZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gY3R4ICYmIGlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgIGlmICghaXNNYXAoc291cmNlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXJnZSBzb3VyY2VzIG11c3QgYmUgbWFwcyBvciBtYXAgYWxpYXNlcycpO1xuICAgIGNvbnN0IHNyY01hcCA9IHNvdXJjZS50b0pTT04obnVsbCwgY3R4LCBNYXApO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHNyY01hcCkge1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWFwLCBrZXkpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBrZXksIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpIHtcbiAgICBpZiAoanNLZXkgPT09IG51bGwpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBpZiAodHlwZW9mIGpzS2V5ICE9PSAnb2JqZWN0JylcbiAgICAgICAgcmV0dXJuIFN0cmluZyhqc0tleSk7XG4gICAgaWYgKGlzTm9kZShrZXkpICYmIGN0eD8uZG9jKSB7XG4gICAgICAgIGNvbnN0IHN0ckN0eCA9IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoY3R4LmRvYywge30pO1xuICAgICAgICBzdHJDdHguYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIGN0eC5hbmNob3JzLmtleXMoKSlcbiAgICAgICAgICAgIHN0ckN0eC5hbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIHN0ckN0eC5pbkZsb3cgPSB0cnVlO1xuICAgICAgICBzdHJDdHguaW5TdHJpbmdpZnlLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBzdHJLZXkgPSBrZXkudG9TdHJpbmcoc3RyQ3R4KTtcbiAgICAgICAgaWYgKCFjdHgubWFwS2V5V2FybmVkKSB7XG4gICAgICAgICAgICBsZXQganNvblN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cktleSk7XG4gICAgICAgICAgICBpZiAoanNvblN0ci5sZW5ndGggPiA0MClcbiAgICAgICAgICAgICAgICBqc29uU3RyID0ganNvblN0ci5zdWJzdHJpbmcoMCwgMzYpICsgJy4uLlwiJztcbiAgICAgICAgICAgIHdhcm4oY3R4LmRvYy5vcHRpb25zLmxvZ0xldmVsLCBgS2V5cyB3aXRoIGNvbGxlY3Rpb24gdmFsdWVzIHdpbGwgYmUgc3RyaW5naWZpZWQgZHVlIHRvIEpTIE9iamVjdCByZXN0cmljdGlvbnM6ICR7anNvblN0cn0uIFNldCBtYXBBc01hcDogdHJ1ZSB0byB1c2Ugb2JqZWN0IGtleXMuYCk7XG4gICAgICAgICAgICBjdHgubWFwS2V5V2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyS2V5O1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoanNLZXkpO1xufVxuXG5leHBvcnQgeyBhZGRQYWlyVG9KU01hcCB9O1xuIiwiaW1wb3J0IHsgY3JlYXRlTm9kZSB9IGZyb20gJy4uL2RvYy9jcmVhdGVOb2RlLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeVBhaXIgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5UGFpci5qcyc7XG5pbXBvcnQgeyBhZGRQYWlyVG9KU01hcCB9IGZyb20gJy4vYWRkUGFpclRvSlNNYXAuanMnO1xuaW1wb3J0IHsgTk9ERV9UWVBFLCBQQUlSLCBpc05vZGUgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuZnVuY3Rpb24gY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBrID0gY3JlYXRlTm9kZShrZXksIHVuZGVmaW5lZCwgY3R4KTtcbiAgICBjb25zdCB2ID0gY3JlYXRlTm9kZSh2YWx1ZSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIHJldHVybiBuZXcgUGFpcihrLCB2KTtcbn1cbmNsYXNzIFBhaXIge1xuICAgIGNvbnN0cnVjdG9yKGtleSwgdmFsdWUgPSBudWxsKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IFBBSVIgfSk7XG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNsb25lKHNjaGVtYSkge1xuICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSB0aGlzO1xuICAgICAgICBpZiAoaXNOb2RlKGtleSkpXG4gICAgICAgICAgICBrZXkgPSBrZXkuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgaWYgKGlzTm9kZSh2YWx1ZSkpXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNsb25lKHNjaGVtYSk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpcihrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBwYWlyID0gY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICByZXR1cm4gYWRkUGFpclRvSlNNYXAoY3R4LCBwYWlyLCB0aGlzKTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIHJldHVybiBjdHg/LmRvY1xuICAgICAgICAgICAgPyBzdHJpbmdpZnlQYWlyKHRoaXMsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH07XG4iLCJpbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vbm9kZXMvQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBpc05vZGUsIGlzUGFpciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGxpbmVDb21tZW50LCBpbmRlbnRDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5Q29sbGVjdGlvbihjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyBjb2xsZWN0aW9uLmZsb3c7XG4gICAgY29uc3Qgc3RyaW5naWZ5ID0gZmxvdyA/IHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uIDogc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uO1xuICAgIHJldHVybiBzdHJpbmdpZnkoY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbih7IGNvbW1lbnQsIGl0ZW1zIH0sIGN0eCwgeyBibG9ja0l0ZW1QcmVmaXgsIGZsb3dDaGFycywgaXRlbUluZGVudCwgb25DaG9tcEtlZXAsIG9uQ29tbWVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBpbmRlbnQ6IGl0ZW1JbmRlbnQsIHR5cGU6IG51bGwgfSk7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlOyAvLyBmbGFnIGZvciB0aGUgcHJlY2VkaW5nIG5vZGUncyBzdGF0dXNcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKGNob21wS2VlcCAmJiBjb21tZW50KVxuICAgICAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxpbmVzLnB1c2goYmxvY2tJdGVtUHJlZml4ICsgc3RyKTtcbiAgICB9XG4gICAgbGV0IHN0cjtcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0ciA9IGZsb3dDaGFycy5zdGFydCArIGZsb3dDaGFycy5lbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBsaW5lc1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBzdHIgKz0gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbih7IGNvbW1lbnQsIGl0ZW1zIH0sIGN0eCwgeyBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQsIG9uQ29tbWVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIGluZGVudFN0ZXAsIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogZmNQYWRkaW5nLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9ID0gY3R4O1xuICAgIGl0ZW1JbmRlbnQgKz0gaW5kZW50U3RlcDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGluZGVudDogaXRlbUluZGVudCxcbiAgICAgICAgaW5GbG93OiB0cnVlLFxuICAgICAgICB0eXBlOiBudWxsXG4gICAgfSk7XG4gICAgbGV0IHJlcU5ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgbGluZXNBdFZhbHVlID0gMDtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmIChpdGVtLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpdGVtLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmIChpay5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpay5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlrLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXYgPSBpc05vZGUoaXRlbS52YWx1ZSkgPyBpdGVtLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpdikge1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gaXYuY29tbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtLnZhbHVlID09IG51bGwgJiYgaWs/LmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaWsuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICBsZXQgc3RyID0gc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCkpO1xuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBpZiAoIXJlcU5ld2xpbmUgJiYgKGxpbmVzLmxlbmd0aCA+IGxpbmVzQXRWYWx1ZSB8fCBzdHIuaW5jbHVkZXMoJ1xcbicpKSlcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICBsaW5lcy5wdXNoKHN0cik7XG4gICAgICAgIGxpbmVzQXRWYWx1ZSA9IGxpbmVzLmxlbmd0aDtcbiAgICB9XG4gICAgbGV0IHN0cjtcbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGZsb3dDaGFycztcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0ciA9IHN0YXJ0ICsgZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBsaW5lcy5yZWR1Y2UoKHN1bSwgbGluZSkgPT4gc3VtICsgbGluZS5sZW5ndGggKyAyLCAyKTtcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSBsZW4gPiBDb2xsZWN0aW9uLm1heEZsb3dTdHJpbmdTaW5nbGVMaW5lTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBzdHIgPSBzdGFydDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcbiAgICAgICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudFN0ZXB9JHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgICAgIHN0ciArPSBgXFxuJHtpbmRlbnR9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IGAke3N0YXJ0fSR7ZmNQYWRkaW5nfSR7bGluZXMuam9pbignICcpfSR7ZmNQYWRkaW5nfSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgaW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuZnVuY3Rpb24gYWRkQ29tbWVudEJlZm9yZSh7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSwgbGluZXMsIGNvbW1lbnQsIGNob21wS2VlcCkge1xuICAgIGlmIChjb21tZW50ICYmIGNob21wS2VlcClcbiAgICAgICAgY29tbWVudCA9IGNvbW1lbnQucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgY29uc3QgaWMgPSBpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGxpbmVzLnB1c2goaWMudHJpbVN0YXJ0KCkpOyAvLyBBdm9pZCBkb3VibGUgaW5kZW50IG9uIGZpcnN0IGxpbmVcbiAgICB9XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBhZGRQYWlyVG9KU01hcCB9IGZyb20gJy4vYWRkUGFpclRvSlNNYXAuanMnO1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4vQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBpc1BhaXIsIGlzU2NhbGFyLCBNQVAgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuL1BhaXIuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gZmluZFBhaXIoaXRlbXMsIGtleSkge1xuICAgIGNvbnN0IGsgPSBpc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGZvciAoY29uc3QgaXQgb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGlzUGFpcihpdCkpIHtcbiAgICAgICAgICAgIGlmIChpdC5rZXkgPT09IGtleSB8fCBpdC5rZXkgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGl0LmtleSkgJiYgaXQua2V5LnZhbHVlID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuY2xhc3MgWUFNTE1hcCBleHRlbmRzIENvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoTUFQLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZ2VuZXJpYyBjb2xsZWN0aW9uIHBhcnNpbmcgbWV0aG9kIHRoYXQgY2FuIGJlIGV4dGVuZGVkXG4gICAgICogdG8gb3RoZXIgbm9kZSBjbGFzc2VzIHRoYXQgaW5oZXJpdCBmcm9tIFlBTUxNYXBcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCwgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgY29uc3QgYWRkID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSAmJiAhcmVwbGFjZXIuaW5jbHVkZXMoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCBrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG9iailcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjaGVtYS5zb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbWFwLml0ZW1zLnNvcnQoc2NoZW1hLnNvcnRNYXBFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIC0gSWYgbm90IHNldCBgdHJ1ZWAsIHVzaW5nIGEga2V5IHRoYXQgaXMgYWxyZWFkeSBpbiB0aGVcbiAgICAgKiAgIGNvbGxlY3Rpb24gd2lsbCB0aHJvdy4gT3RoZXJ3aXNlLCBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICAgKi9cbiAgICBhZGQocGFpciwgb3ZlcndyaXRlKSB7XG4gICAgICAgIGxldCBfcGFpcjtcbiAgICAgICAgaWYgKGlzUGFpcihwYWlyKSlcbiAgICAgICAgICAgIF9wYWlyID0gcGFpcjtcbiAgICAgICAgZWxzZSBpZiAoIXBhaXIgfHwgdHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8ICEoJ2tleScgaW4gcGFpcikpIHtcbiAgICAgICAgICAgIC8vIEluIFR5cGVTY3JpcHQsIHRoaXMgbmV2ZXIgaGFwcGVucy5cbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpciwgcGFpcj8udmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgX3BhaXIua2V5KTtcbiAgICAgICAgY29uc3Qgc29ydEVudHJpZXMgPSB0aGlzLnNjaGVtYT8uc29ydE1hcEVudHJpZXM7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICBpZiAoIW92ZXJ3cml0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke19wYWlyLmtleX0gYWxyZWFkeSBzZXRgKTtcbiAgICAgICAgICAgIC8vIEZvciBzY2FsYXJzLCBrZWVwIHRoZSBvbGQgbm9kZSAmIGl0cyBjb21tZW50cyBhbmQgYW5jaG9yc1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKHByZXYudmFsdWUpICYmIGlzU2NhbGFyVmFsdWUoX3BhaXIudmFsdWUpKVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc29ydEVudHJpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLml0ZW1zLmZpbmRJbmRleChpdGVtID0+IHNvcnRFbnRyaWVzKF9wYWlyLCBpdGVtKSA8IDApO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaSwgMCwgX3BhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKCFpdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKGl0KSwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBpdD8udmFsdWU7XG4gICAgICAgIHJldHVybiAoIWtlZXBTY2FsYXIgJiYgaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZSkgPz8gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiAhIWZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYWRkKG5ldyBQYWlyKGtleSwgdmFsdWUpLCB0cnVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpXG4gICAgICogQHBhcmFtIHtDbGFzc30gVHlwZSAtIElmIHNldCwgZm9yY2VzIHRoZSByZXR1cm5lZCBjb2xsZWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiBUeXBlLCBNYXAsIG9yIE9iamVjdFxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgsIFR5cGUpIHtcbiAgICAgICAgY29uc3QgbWFwID0gVHlwZSA/IG5ldyBUeXBlKCkgOiBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIGl0ZW0pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1hcCBpdGVtcyBtdXN0IGFsbCBiZSBwYWlyczsgZm91bmQgJHtKU09OLnN0cmluZ2lmeShpdGVtKX0gaW5zdGVhZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY3R4LmFsbE51bGxWYWx1ZXMgJiYgdGhpcy5oYXNBbGxOdWxsVmFsdWVzKGZhbHNlKSlcbiAgICAgICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJycsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICd7JywgZW5kOiAnfScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IGN0eC5pbmRlbnQgfHwgJycsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFlBTUxNYXAsIGZpbmRQYWlyIH07XG4iLCJpbXBvcnQgeyBpc01hcCB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJztcblxuY29uc3QgbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdtYXAnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MTWFwLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcsXG4gICAgcmVzb2x2ZShtYXAsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKCFpc01hcChtYXApKVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBtYXBwaW5nIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxNYXAuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0IHsgbWFwIH07XG4iLCJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5Q29sbGVjdGlvbiB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgU0VRLCBpc1NjYWxhciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBZQU1MU2VxIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOnNlcSc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihTRVEsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgaXQgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihpdCkgPyBpdC52YWx1ZSA6IGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBpZHggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBga2V5YCBkb2VzIG5vdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciwgdGhpcyB3aWxsIHRocm93LlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHZhbGlkIGluZGV4LCBub3QgJHtrZXl9LmApO1xuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICBpZiAoaXNTY2FsYXIocHJldikgJiYgaXNTY2FsYXJWYWx1ZSh2YWx1ZSkpXG4gICAgICAgICAgICBwcmV2LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaWR4XSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHNlcSA9IFtdO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShzZXEpO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgc2VxLnB1c2godG9KUyhpdGVtLCBTdHJpbmcoaSsrKSwgY3R4KSk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICctICcsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICdbJywgZW5kOiAnXScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IChjdHguaW5kZW50IHx8ICcnKSArICcgICcsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNlcSA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChvYmogJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChvYmopKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpdCBvZiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IG9iaiBpbnN0YW5jZW9mIFNldCA/IGl0IDogU3RyaW5nKGkrKyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaChjcmVhdGVOb2RlKGl0LCB1bmRlZmluZWQsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNJdGVtSW5kZXgoa2V5KSB7XG4gICAgbGV0IGlkeCA9IGlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgaWYgKGlkeCAmJiB0eXBlb2YgaWR4ID09PSAnc3RyaW5nJylcbiAgICAgICAgaWR4ID0gTnVtYmVyKGlkeCk7XG4gICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaWR4KSAmJiBpZHggPj0gMFxuICAgICAgICA/IGlkeFxuICAgICAgICA6IG51bGw7XG59XG5cbmV4cG9ydCB7IFlBTUxTZXEgfTtcbiIsImltcG9ydCB7IGlzU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuXG5jb25zdCBzZXEgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXEsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlzU2VxKHNlcSkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxTZXEuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0IHsgc2VxIH07XG4iLCJpbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuY29uc3Qgc3RyaW5nID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyxcbiAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7IGFjdHVhbFN0cmluZzogdHJ1ZSB9LCBjdHgpO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgc3RyaW5nIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5jb25zdCBudWxsVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICB0ZXN0OiAvXig/On58W05uXXVsbHxOVUxMKT8kLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyKG51bGwpLFxuICAgIHN0cmluZ2lmeTogKHsgc291cmNlIH0sIGN0eCkgPT4gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgJiYgbnVsbFRhZy50ZXN0LnRlc3Qoc291cmNlKVxuICAgICAgICA/IHNvdXJjZVxuICAgICAgICA6IGN0eC5vcHRpb25zLm51bGxTdHJcbn07XG5cbmV4cG9ydCB7IG51bGxUYWcgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IGJvb2xUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpbVHRdcnVlfFRSVUV8W0ZmXWFsc2V8RkFMU0UpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IG5ldyBTY2FsYXIoc3RyWzBdID09PSAndCcgfHwgc3RyWzBdID09PSAnVCcpLFxuICAgIHN0cmluZ2lmeSh7IHNvdXJjZSwgdmFsdWUgfSwgY3R4KSB7XG4gICAgICAgIGlmIChzb3VyY2UgJiYgYm9vbFRhZy50ZXN0LnRlc3Qoc291cmNlKSkge1xuICAgICAgICAgICAgY29uc3Qgc3YgPSBzb3VyY2VbMF0gPT09ICd0JyB8fCBzb3VyY2VbMF0gPT09ICdUJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc3YpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgYm9vbFRhZyB9O1xuIiwiZnVuY3Rpb24gc3RyaW5naWZ5TnVtYmVyKHsgZm9ybWF0LCBtaW5GcmFjdGlvbkRpZ2l0cywgdGFnLCB2YWx1ZSB9KSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKVxuICAgICAgICByZXR1cm4gaXNOYU4obnVtKSA/ICcubmFuJyA6IG51bSA8IDAgPyAnLS5pbmYnIDogJy5pbmYnO1xuICAgIGxldCBuID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmICghZm9ybWF0ICYmXG4gICAgICAgIG1pbkZyYWN0aW9uRGlnaXRzICYmXG4gICAgICAgICghdGFnIHx8IHRhZyA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JykgJiZcbiAgICAgICAgL15cXGQvLnRlc3QobikpIHtcbiAgICAgICAgbGV0IGkgPSBuLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICBpID0gbi5sZW5ndGg7XG4gICAgICAgICAgICBuICs9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZCA9IG1pbkZyYWN0aW9uRGlnaXRzIC0gKG4ubGVuZ3RoIC0gaSAtIDEpO1xuICAgICAgICB3aGlsZSAoZC0tID4gMClcbiAgICAgICAgICAgIG4gKz0gJzAnO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORnxuYW58TmFOfE5BTikpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldKyg/OlxcLlswLTldKik/KVtlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpcXC5bMC05XSt8WzAtOV0rXFwuWzAtOV0qKSQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBzdHIubGVuZ3RoIC0gZG90IC0gMTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuY29uc3QgaW50UmVzb2x2ZSA9IChzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkgPT4gKGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIuc3Vic3RyaW5nKG9mZnNldCksIHJhZGl4KSk7XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwKVxuICAgICAgICByZXR1cm4gcHJlZml4ICsgdmFsdWUudG9TdHJpbmcocmFkaXgpO1xuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRPY3QgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdPQ1QnLFxuICAgIHRlc3Q6IC9eMG9bMC03XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwbycpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDAsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL14weFswLTlhLWZBLUZdKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0IHsgaW50LCBpbnRIZXgsIGludE9jdCB9O1xuIiwiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJvb2xUYWcgfSBmcm9tICcuL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXROYU4sIGZsb2F0RXhwLCBmbG9hdCB9IGZyb20gJy4vZmxvYXQuanMnO1xuaW1wb3J0IHsgaW50T2N0LCBpbnQsIGludEhleCB9IGZyb20gJy4vaW50LmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgYm9vbFRhZyxcbiAgICBpbnRPY3QsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuLi9jb21tb24vc2VxLmpzJztcblxuZnVuY3Rpb24gaW50SWRlbnRpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbn1cbmNvbnN0IHN0cmluZ2lmeUpTT04gPSAoeyB2YWx1ZSB9KSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5jb25zdCBqc29uU2NhbGFycyA9IFtcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgICAgICB0ZXN0OiAvXm51bGwkLyxcbiAgICAgICAgcmVzb2x2ZTogKCkgPT4gbnVsbCxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgICAgIHRlc3Q6IC9edHJ1ZXxmYWxzZSQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyID09PSAndHJ1ZScsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSQvLFxuICAgICAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLCAxMCksXG4gICAgICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gaW50SWRlbnRpZnkodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikoPzpcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH1cbl07XG5jb25zdCBqc29uRXJyb3IgPSB7XG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICcnLFxuICAgIHRlc3Q6IC9eLyxcbiAgICByZXNvbHZlKHN0ciwgb25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBVbnJlc29sdmVkIHBsYWluIHNjYWxhciAke0pTT04uc3RyaW5naWZ5KHN0cil9YCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcbmNvbnN0IHNjaGVtYSA9IFttYXAsIHNlcV0uY29uY2F0KGpzb25TY2FsYXJzLCBqc29uRXJyb3IpO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuY29uc3QgYmluYXJ5ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXksXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JyxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQnVmZmVyIGluIG5vZGUgYW5kIGFuIFVpbnQ4QXJyYXkgaW4gYnJvd3NlcnNcbiAgICAgKlxuICAgICAqIFRvIHVzZSB0aGUgcmVzdWx0aW5nIGJ1ZmZlciBhcyBhbiBpbWFnZSwgeW91J2xsIHdhbnQgdG8gZG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICpcbiAgICAgKiAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiAnaW1hZ2UvanBlZycgfSlcbiAgICAgKiAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaG90bycpLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgICAgKi9cbiAgICByZXNvbHZlKHNyYywgb25FcnJvcikge1xuICAgICAgICBpZiAodHlwZW9mIEJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHNyYywgJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhdG9iID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBPbiBJRSAxMSwgYXRvYigpIGNhbid0IGhhbmRsZSBuZXdsaW5lc1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gYXRvYihzcmMucmVwbGFjZSgvW1xcblxccl0vZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgYnVmZmVyW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb25FcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHJlYWRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYXRvYiBpcyByZXF1aXJlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNyYztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RyaW5naWZ5KHsgY29tbWVudCwgdHlwZSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IHZhbHVlOyAvLyBjaGVja2VkIGVhcmxpZXIgYnkgYmluYXJ5LmlkZW50aWZ5KClcbiAgICAgICAgbGV0IHN0cjtcbiAgICAgICAgaWYgKHR5cGVvZiBCdWZmZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciA9XG4gICAgICAgICAgICAgICAgYnVmIGluc3RhbmNlb2YgQnVmZmVyXG4gICAgICAgICAgICAgICAgICAgID8gYnVmLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgICAgICAgICA6IEJ1ZmZlci5mcm9tKGJ1Zi5idWZmZXIpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbGV0IHMgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pO1xuICAgICAgICAgICAgc3RyID0gYnRvYShzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHdyaXRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYnRvYSBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdHlwZSlcbiAgICAgICAgICAgIHR5cGUgPSBTY2FsYXIuQkxPQ0tfTElURVJBTDtcbiAgICAgICAgaWYgKHR5cGUgIT09IFNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVXaWR0aCA9IE1hdGgubWF4KGN0eC5vcHRpb25zLmxpbmVXaWR0aCAtIGN0eC5pbmRlbnQubGVuZ3RoLCBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbiA9IE1hdGguY2VpbChzdHIubGVuZ3RoIC8gbGluZVdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gbmV3IEFycmF5KG4pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIG8gPSAwOyBpIDwgbjsgKytpLCBvICs9IGxpbmVXaWR0aCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gc3RyLnN1YnN0cihvLCBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID0gbGluZXMuam9pbih0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTCA/ICdcXG4nIDogJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nKHsgY29tbWVudCwgdHlwZSwgdmFsdWU6IHN0ciB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IGJpbmFyeSB9O1xuIiwiaW1wb3J0IHsgaXNTZXEsIGlzUGFpciwgaXNNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlUGFpcnMoc2VxLCBvbkVycm9yKSB7XG4gICAgaWYgKGlzU2VxKHNlcSkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXEuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gc2VxLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKGlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzTWFwKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXRlbXMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignRWFjaCBwYWlyIG11c3QgaGF2ZSBpdHMgb3duIHNlcXVlbmNlIGluZGljYXRvcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBpdGVtLml0ZW1zWzBdIHx8IG5ldyBQYWlyKG5ldyBTY2FsYXIobnVsbCkpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHBhaXIua2V5LmNvbW1lbnRCZWZvcmUgPSBwYWlyLmtleS5jb21tZW50QmVmb3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudEJlZm9yZX1cXG4ke3BhaXIua2V5LmNvbW1lbnRCZWZvcmV9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbiA9IHBhaXIudmFsdWUgPz8gcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNuLmNvbW1lbnQgPSBjbi5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudH1cXG4ke2NuLmNvbW1lbnR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBwYWlyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VxLml0ZW1zW2ldID0gaXNQYWlyKGl0ZW0pID8gaXRlbSA6IG5ldyBQYWlyKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICByZXR1cm4gc2VxO1xufVxuZnVuY3Rpb24gY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgIGNvbnN0IHBhaXJzID0gbmV3IFlBTUxTZXEoc2NoZW1hKTtcbiAgICBwYWlycy50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnO1xuICAgIGxldCBpID0gMDtcbiAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgIGZvciAobGV0IGl0IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgU3RyaW5nKGkrKyksIGl0KTtcbiAgICAgICAgICAgIGxldCBrZXksIHZhbHVlO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBpdFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBba2V5LCB2YWx1ZV0gdHVwbGU6ICR7aXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdCAmJiBpdCBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhpdCk7XG4gICAgICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGtleXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHR1cGxlIHdpdGggb25lIGtleSwgbm90ICR7a2V5cy5sZW5ndGh9IGtleXNgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhaXJzLml0ZW1zLnB1c2goY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpKTtcbiAgICAgICAgfVxuICAgIHJldHVybiBwYWlycztcbn1cbmNvbnN0IHBhaXJzID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJyxcbiAgICByZXNvbHZlOiByZXNvbHZlUGFpcnMsXG4gICAgY3JlYXRlTm9kZTogY3JlYXRlUGFpcnNcbn07XG5cbmV4cG9ydCB7IGNyZWF0ZVBhaXJzLCBwYWlycywgcmVzb2x2ZVBhaXJzIH07XG4iLCJpbXBvcnQgeyBpc1NjYWxhciwgaXNQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4uLy4uL25vZGVzL3RvSlMuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVBhaXJzLCBjcmVhdGVQYWlycyB9IGZyb20gJy4vcGFpcnMuanMnO1xuXG5jbGFzcyBZQU1MT01hcCBleHRlbmRzIFlBTUxTZXEge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZCA9IFlBTUxNYXAucHJvdG90eXBlLmFkZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IFlBTUxNYXAucHJvdG90eXBlLmRlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldCA9IFlBTUxNYXAucHJvdG90eXBlLmdldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhcyA9IFlBTUxNYXAucHJvdG90eXBlLmhhcy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNldCA9IFlBTUxNYXAucHJvdG90eXBlLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxPTWFwLnRhZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGN0eGAgaXMgZ2l2ZW4sIHRoZSByZXR1cm4gdHlwZSBpcyBhY3R1YWxseSBgTWFwPHVua25vd24sIHVua25vd24+YCxcbiAgICAgKiBidXQgVHlwZVNjcmlwdCB3b24ndCBhbGxvdyB3aWRlbmluZyB0aGUgc2lnbmF0dXJlIG9mIGEgY2hpbGQgbWV0aG9kLlxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8pO1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc1BhaXIocGFpcikpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTKHBhaXIua2V5LCAnJywgY3R4KTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRvSlMocGFpci52YWx1ZSwga2V5LCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUyhwYWlyLCAnJywgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5cycpO1xuICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpO1xuICAgICAgICBjb25zdCBvbWFwID0gbmV3IHRoaXMoKTtcbiAgICAgICAgb21hcC5pdGVtcyA9IHBhaXJzLml0ZW1zO1xuICAgICAgICByZXR1cm4gb21hcDtcbiAgICB9XG59XG5ZQU1MT01hcC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc7XG5jb25zdCBvbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIE1hcCxcbiAgICBub2RlQ2xhc3M6IFlBTUxPTWFwLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcik7XG4gICAgICAgIGNvbnN0IHNlZW5LZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBwYWlycy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VlbktleXMuaW5jbHVkZXMoa2V5LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGBPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5czogJHtrZXkudmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWVuS2V5cy5wdXNoKGtleS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MT01hcCgpLCBwYWlycyk7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MT01hcC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eClcbn07XG5cbmV4cG9ydCB7IFlBTUxPTWFwLCBvbWFwIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5mdW5jdGlvbiBib29sU3RyaW5naWZ5KHsgdmFsdWUsIHNvdXJjZSB9LCBjdHgpIHtcbiAgICBjb25zdCBib29sT2JqID0gdmFsdWUgPyB0cnVlVGFnIDogZmFsc2VUYWc7XG4gICAgaWYgKHNvdXJjZSAmJiBib29sT2JqLnRlc3QudGVzdChzb3VyY2UpKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIHJldHVybiB2YWx1ZSA/IGN0eC5vcHRpb25zLnRydWVTdHIgOiBjdHgub3B0aW9ucy5mYWxzZVN0cjtcbn1cbmNvbnN0IHRydWVUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSB0cnVlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpZfHl8W1l5XWVzfFlFU3xbVHRdcnVlfFRSVUV8W09vXW58T04pJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcih0cnVlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5jb25zdCBmYWxzZVRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IGZhbHNlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpOfG58W05uXW98Tk98W0ZmXWFsc2V8RkFMU0V8W09vXWZmfE9GRikkL2ksXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcihmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuXG5leHBvcnQgeyBmYWxzZVRhZywgdHJ1ZVRhZyB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/XFwuKD86aW5mfEluZnxJTkZ8bmFufE5hTnxOQU4pJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopPyg/OlxcLlswLTlfXSopP1tlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICB9XG59O1xuY29uc3QgZmxvYXQgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/XFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmID0gc3RyLnN1YnN0cmluZyhkb3QgKyAxKS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIGlmIChmW2YubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gZi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuZnVuY3Rpb24gaW50UmVzb2x2ZShzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgaWYgKHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycpXG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICBpZiAoaW50QXNCaWdJbnQpIHtcbiAgICAgICAgc3dpdGNoIChyYWRpeCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwYiR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBvJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgc3RyID0gYDB4JHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuID0gQmlnSW50KHN0cik7XG4gICAgICAgIHJldHVybiBzaWduID09PSAnLScgPyBCaWdJbnQoLTEpICogbiA6IG47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUludChzdHIsIHJhZGl4KTtcbiAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gLTEgKiBuIDogbjtcbn1cbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/ICctJyArIHByZWZpeCArIHN0ci5zdWJzdHIoMSkgOiBwcmVmaXggKyBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRCaW4gPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdCSU4nLFxuICAgIHRlc3Q6IC9eWy0rXT8wYlswLTFfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDIsICcwYicpXG59O1xuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXlstK10/MFswLTdfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMSwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXlstK10/MHhbMC05YS1mQS1GX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnQgeyBpbnQsIGludEJpbiwgaW50SGV4LCBpbnRPY3QgfTtcbiIsImltcG9ydCB7IGlzTWFwLCBpc1BhaXIsIGlzU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgUGFpciwgY3JlYXRlUGFpciB9IGZyb20gJy4uLy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCwgZmluZFBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJztcblxuY2xhc3MgWUFNTFNldCBleHRlbmRzIFlBTUxNYXAge1xuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihzY2hlbWEpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxTZXQudGFnO1xuICAgIH1cbiAgICBhZGQoa2V5KSB7XG4gICAgICAgIGxldCBwYWlyO1xuICAgICAgICBpZiAoaXNQYWlyKGtleSkpXG4gICAgICAgICAgICBwYWlyID0ga2V5O1xuICAgICAgICBlbHNlIGlmIChrZXkgJiZcbiAgICAgICAgICAgIHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAna2V5JyBpbiBrZXkgJiZcbiAgICAgICAgICAgICd2YWx1ZScgaW4ga2V5ICYmXG4gICAgICAgICAgICBrZXkudmFsdWUgPT09IG51bGwpXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIoa2V5LmtleSwgbnVsbCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpcihrZXksIG51bGwpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgcGFpci5rZXkpO1xuICAgICAgICBpZiAoIXByZXYpXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gocGFpcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElmIGBrZWVwUGFpcmAgaXMgYHRydWVgLCByZXR1cm5zIHRoZSBQYWlyIG1hdGNoaW5nIGBrZXlgLlxuICAgICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhhdCBQYWlyJ3Mga2V5LlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBQYWlyKSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICByZXR1cm4gIWtlZXBQYWlyICYmIGlzUGFpcihwYWlyKVxuICAgICAgICAgICAgPyBpc1NjYWxhcihwYWlyLmtleSlcbiAgICAgICAgICAgICAgICA/IHBhaXIua2V5LnZhbHVlXG4gICAgICAgICAgICAgICAgOiBwYWlyLmtleVxuICAgICAgICAgICAgOiBwYWlyO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGJvb2xlYW4gdmFsdWUgZm9yIHNldChrZXksIHZhbHVlKSBpbiBhIFlBTUwgc2V0LCBub3QgJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBpZiAocHJldiAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihwcmV2KSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXByZXYgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChuZXcgUGFpcihrZXkpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIHJldHVybiBzdXBlci50b0pTT04oXywgY3R4LCBTZXQpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGFsbE51bGxWYWx1ZXM6IHRydWUgfSksIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldCBpdGVtcyBtdXN0IGFsbCBoYXZlIG51bGwgdmFsdWVzJyk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNldCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCB2YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNldC5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIodmFsdWUsIG51bGwsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH1cbn1cbllBTUxTZXQudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc7XG5jb25zdCBzZXQgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgU2V0LFxuICAgIG5vZGVDbGFzczogWUFNTFNldCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxTZXQuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmIChpc01hcChtYXApKSB7XG4gICAgICAgICAgICBpZiAobWFwLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxTZXQoKSwgbWFwKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBZQU1MU2V0LCBzZXQgfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG4vKiogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC4gKi9cbmZ1bmN0aW9uIHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBhc0JpZ0ludCkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgY29uc3QgcGFydHMgPSBzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnID8gc3RyLnN1YnN0cmluZygxKSA6IHN0cjtcbiAgICBjb25zdCBudW0gPSAobikgPT4gYXNCaWdJbnQgPyBCaWdJbnQobikgOiBOdW1iZXIobik7XG4gICAgY29uc3QgcmVzID0gcGFydHNcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJycpXG4gICAgICAgIC5zcGxpdCgnOicpXG4gICAgICAgIC5yZWR1Y2UoKHJlcywgcCkgPT4gcmVzICogbnVtKDYwKSArIG51bShwKSwgbnVtKDApKTtcbiAgICByZXR1cm4gKHNpZ24gPT09ICctJyA/IG51bSgtMSkgKiByZXMgOiByZXMpO1xufVxuLyoqXG4gKiBoaGhoOm1tOnNzLnNzc1xuICpcbiAqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVNleGFnZXNpbWFsKG5vZGUpIHtcbiAgICBsZXQgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBsZXQgbnVtID0gKG4pID0+IG47XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIG51bSA9IG4gPT4gQmlnSW50KG4pO1xuICAgIGVsc2UgaWYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIGxldCBzaWduID0gJyc7XG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICBzaWduID0gJy0nO1xuICAgICAgICB2YWx1ZSAqPSBudW0oLTEpO1xuICAgIH1cbiAgICBjb25zdCBfNjAgPSBudW0oNjApO1xuICAgIGNvbnN0IHBhcnRzID0gW3ZhbHVlICUgXzYwXTsgLy8gc2Vjb25kcywgaW5jbHVkaW5nIG1zXG4gICAgaWYgKHZhbHVlIDwgNjApIHtcbiAgICAgICAgcGFydHMudW5zaGlmdCgwKTsgLy8gYXQgbGVhc3Qgb25lIDogaXMgcmVxdWlyZWRcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlICUgXzYwKTsgLy8gbWludXRlc1xuICAgICAgICBpZiAodmFsdWUgPj0gNjApIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSk7IC8vIGhvdXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChzaWduICtcbiAgICAgICAgcGFydHNcbiAgICAgICAgICAgIC5tYXAobiA9PiBTdHJpbmcobikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgICAgIC5qb2luKCc6JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8wMDAwMDBcXGQqJC8sICcnKSAvLyAlIDYwIG1heSBpbnRyb2R1Y2UgZXJyb3JcbiAgICApO1xufVxuY29uc3QgaW50VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGludEFzQmlnSW50KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgZmxvYXRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgdGltZXN0YW1wID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLFxuICAgIC8vIElmIHRoZSB0aW1lIHpvbmUgaXMgb21pdHRlZCwgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIHNwZWNpZmllZCBpbiBVVEMuIFRoZSB0aW1lIHBhcnRcbiAgICAvLyBtYXkgYmUgb21pdHRlZCBhbHRvZ2V0aGVyLCByZXN1bHRpbmcgaW4gYSBkYXRlIGZvcm1hdC4gSW4gc3VjaCBhIGNhc2UsIHRoZSB0aW1lIHBhcnQgaXNcbiAgICAvLyBhc3N1bWVkIHRvIGJlIDAwOjAwOjAwWiAoc3RhcnQgb2YgZGF5LCBVVEMpLlxuICAgIHRlc3Q6IFJlZ0V4cCgnXihbMC05XXs0fSktKFswLTldezEsMn0pLShbMC05XXsxLDJ9KScgKyAvLyBZWVlZLU1tLURkXG4gICAgICAgICcoPzonICsgLy8gdGltZSBpcyBvcHRpb25hbFxuICAgICAgICAnKD86dHxUfFsgXFxcXHRdKyknICsgLy8gdCB8IFQgfCB3aGl0ZXNwYWNlXG4gICAgICAgICcoWzAtOV17MSwyfSk6KFswLTldezEsMn0pOihbMC05XXsxLDJ9KFxcXFwuWzAtOV0rKT8pJyArIC8vIEhoOk1tOlNzKC5zcyk/XG4gICAgICAgICcoPzpbIFxcXFx0XSooWnxbLStdWzAxMl0/WzAtOV0oPzo6WzAtOV17Mn0pPykpPycgKyAvLyBaIHwgKzUgfCAtMDM6MzBcbiAgICAgICAgJyk/JCcpLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKHRpbWVzdGFtcC50ZXN0KTtcbiAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignISF0aW1lc3RhbXAgZXhwZWN0cyBhIGRhdGUsIHN0YXJ0aW5nIHdpdGggeXl5eS1tbS1kZCcpO1xuICAgICAgICBjb25zdCBbLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZF0gPSBtYXRjaC5tYXAoTnVtYmVyKTtcbiAgICAgICAgY29uc3QgbWlsbGlzZWMgPSBtYXRjaFs3XSA/IE51bWJlcigobWF0Y2hbN10gKyAnMDAnKS5zdWJzdHIoMSwgMykpIDogMDtcbiAgICAgICAgbGV0IGRhdGUgPSBEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciB8fCAwLCBtaW51dGUgfHwgMCwgc2Vjb25kIHx8IDAsIG1pbGxpc2VjKTtcbiAgICAgICAgY29uc3QgdHogPSBtYXRjaFs4XTtcbiAgICAgICAgaWYgKHR6ICYmIHR6ICE9PSAnWicpIHtcbiAgICAgICAgICAgIGxldCBkID0gcGFyc2VTZXhhZ2VzaW1hbCh0eiwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGQpIDwgMzApXG4gICAgICAgICAgICAgICAgZCAqPSA2MDtcbiAgICAgICAgICAgIGRhdGUgLT0gNjAwMDAgKiBkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlKTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gdmFsdWUudG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oKFQwMDowMCk/OjAwKT9cXC4wMDBaJC8sICcnKVxufTtcblxuZXhwb3J0IHsgZmxvYXRUaW1lLCBpbnRUaW1lLCB0aW1lc3RhbXAgfTtcbiIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4uL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4uL2NvbW1vbi9udWxsLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4uL2NvbW1vbi9zZXEuanMnO1xuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnLi4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBiaW5hcnkgfSBmcm9tICcuL2JpbmFyeS5qcyc7XG5pbXBvcnQgeyB0cnVlVGFnLCBmYWxzZVRhZyB9IGZyb20gJy4vYm9vbC5qcyc7XG5pbXBvcnQgeyBmbG9hdE5hTiwgZmxvYXRFeHAsIGZsb2F0IH0gZnJvbSAnLi9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnRCaW4sIGludE9jdCwgaW50LCBpbnRIZXggfSBmcm9tICcuL2ludC5qcyc7XG5pbXBvcnQgeyBvbWFwIH0gZnJvbSAnLi9vbWFwLmpzJztcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSAnLi9wYWlycy5qcyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuL3NldC5qcyc7XG5pbXBvcnQgeyBpbnRUaW1lLCBmbG9hdFRpbWUsIHRpbWVzdGFtcCB9IGZyb20gJy4vdGltZXN0YW1wLmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgdHJ1ZVRhZyxcbiAgICBmYWxzZVRhZyxcbiAgICBpbnRCaW4sXG4gICAgaW50T2N0LFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXQsXG4gICAgYmluYXJ5LFxuICAgIG9tYXAsXG4gICAgcGFpcnMsXG4gICAgc2V0LFxuICAgIGludFRpbWUsXG4gICAgZmxvYXRUaW1lLFxuICAgIHRpbWVzdGFtcFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCJpbXBvcnQgeyBtYXAgfSBmcm9tICcuL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBib29sVGFnIH0gZnJvbSAnLi9jb3JlL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9IGZyb20gJy4vY29yZS9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnQsIGludEhleCwgaW50T2N0IH0gZnJvbSAnLi9jb3JlL2ludC5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICcuL2NvcmUvc2NoZW1hLmpzJztcbmltcG9ydCB7IHNjaGVtYSBhcyBzY2hlbWEkMSB9IGZyb20gJy4vanNvbi9zY2hlbWEuanMnO1xuaW1wb3J0IHsgYmluYXJ5IH0gZnJvbSAnLi95YW1sLTEuMS9iaW5hcnkuanMnO1xuaW1wb3J0IHsgb21hcCB9IGZyb20gJy4veWFtbC0xLjEvb21hcC5qcyc7XG5pbXBvcnQgeyBwYWlycyB9IGZyb20gJy4veWFtbC0xLjEvcGFpcnMuanMnO1xuaW1wb3J0IHsgc2NoZW1hIGFzIHNjaGVtYSQyIH0gZnJvbSAnLi95YW1sLTEuMS9zY2hlbWEuanMnO1xuaW1wb3J0IHsgc2V0IH0gZnJvbSAnLi95YW1sLTEuMS9zZXQuanMnO1xuaW1wb3J0IHsgdGltZXN0YW1wLCBmbG9hdFRpbWUsIGludFRpbWUgfSBmcm9tICcuL3lhbWwtMS4xL3RpbWVzdGFtcC5qcyc7XG5cbmNvbnN0IHNjaGVtYXMgPSBuZXcgTWFwKFtcbiAgICBbJ2NvcmUnLCBzY2hlbWFdLFxuICAgIFsnZmFpbHNhZmUnLCBbbWFwLCBzZXEsIHN0cmluZ11dLFxuICAgIFsnanNvbicsIHNjaGVtYSQxXSxcbiAgICBbJ3lhbWwxMScsIHNjaGVtYSQyXSxcbiAgICBbJ3lhbWwtMS4xJywgc2NoZW1hJDJdXG5dKTtcbmNvbnN0IHRhZ3NCeU5hbWUgPSB7XG4gICAgYmluYXJ5LFxuICAgIGJvb2w6IGJvb2xUYWcsXG4gICAgZmxvYXQsXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRUaW1lLFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgaW50T2N0LFxuICAgIGludFRpbWUsXG4gICAgbWFwLFxuICAgIG51bGw6IG51bGxUYWcsXG4gICAgb21hcCxcbiAgICBwYWlycyxcbiAgICBzZXEsXG4gICAgc2V0LFxuICAgIHRpbWVzdGFtcFxufTtcbmNvbnN0IGNvcmVLbm93blRhZ3MgPSB7XG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeSc6IGJpbmFyeSxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc6IG9tYXAsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJzogcGFpcnMsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc6IHNldCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJzogdGltZXN0YW1wXG59O1xuZnVuY3Rpb24gZ2V0VGFncyhjdXN0b21UYWdzLCBzY2hlbWFOYW1lKSB7XG4gICAgbGV0IHRhZ3MgPSBzY2hlbWFzLmdldChzY2hlbWFOYW1lKTtcbiAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpXG4gICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oc2NoZW1hcy5rZXlzKCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAneWFtbDExJylcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHNjaGVtYSBcIiR7c2NoZW1hTmFtZX1cIjsgdXNlIG9uZSBvZiAke2tleXN9IG9yIGRlZmluZSBjdXN0b21UYWdzIGFycmF5YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgY3VzdG9tVGFncylcbiAgICAgICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdCh0YWcpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgY3VzdG9tVGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0YWdzID0gY3VzdG9tVGFncyh0YWdzLnNsaWNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGFncy5tYXAodGFnID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YWcgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgY29uc3QgdGFnT2JqID0gdGFnc0J5TmFtZVt0YWddO1xuICAgICAgICBpZiAodGFnT2JqKVxuICAgICAgICAgICAgcmV0dXJuIHRhZ09iajtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3NCeU5hbWUpXG4gICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBjdXN0b20gdGFnIFwiJHt0YWd9XCI7IHVzZSBvbmUgb2YgJHtrZXlzfWApO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBjb3JlS25vd25UYWdzLCBnZXRUYWdzIH07XG4iLCJpbXBvcnQgeyBNQVAsIFNDQUxBUiwgU0VRIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi9jb21tb24vbWFwLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuL2NvbW1vbi9zdHJpbmcuanMnO1xuaW1wb3J0IHsgZ2V0VGFncywgY29yZUtub3duVGFncyB9IGZyb20gJy4vdGFncy5qcyc7XG5cbmNvbnN0IHNvcnRNYXBFbnRyaWVzQnlLZXkgPSAoYSwgYikgPT4gYS5rZXkgPCBiLmtleSA/IC0xIDogYS5rZXkgPiBiLmtleSA/IDEgOiAwO1xuY2xhc3MgU2NoZW1hIHtcbiAgICBjb25zdHJ1Y3Rvcih7IGNvbXBhdCwgY3VzdG9tVGFncywgbWVyZ2UsIHJlc29sdmVLbm93blRhZ3MsIHNjaGVtYSwgc29ydE1hcEVudHJpZXMsIHRvU3RyaW5nRGVmYXVsdHMgfSkge1xuICAgICAgICB0aGlzLmNvbXBhdCA9IEFycmF5LmlzQXJyYXkoY29tcGF0KVxuICAgICAgICAgICAgPyBnZXRUYWdzKGNvbXBhdCwgJ2NvbXBhdCcpXG4gICAgICAgICAgICA6IGNvbXBhdFxuICAgICAgICAgICAgICAgID8gZ2V0VGFncyhudWxsLCBjb21wYXQpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICB0aGlzLm1lcmdlID0gISFtZXJnZTtcbiAgICAgICAgdGhpcy5uYW1lID0gKHR5cGVvZiBzY2hlbWEgPT09ICdzdHJpbmcnICYmIHNjaGVtYSkgfHwgJ2NvcmUnO1xuICAgICAgICB0aGlzLmtub3duVGFncyA9IHJlc29sdmVLbm93blRhZ3MgPyBjb3JlS25vd25UYWdzIDoge307XG4gICAgICAgIHRoaXMudGFncyA9IGdldFRhZ3MoY3VzdG9tVGFncywgdGhpcy5uYW1lKTtcbiAgICAgICAgdGhpcy50b1N0cmluZ09wdGlvbnMgPSB0b1N0cmluZ0RlZmF1bHRzID8/IG51bGw7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBNQVAsIHsgdmFsdWU6IG1hcCB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFNDQUxBUiwgeyB2YWx1ZTogc3RyaW5nIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgU0VRLCB7IHZhbHVlOiBzZXEgfSk7XG4gICAgICAgIC8vIFVzZWQgYnkgY3JlYXRlTWFwKClcbiAgICAgICAgdGhpcy5zb3J0TWFwRW50cmllcyA9XG4gICAgICAgICAgICB0eXBlb2Ygc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzXG4gICAgICAgICAgICAgICAgOiBzb3J0TWFwRW50cmllcyA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzQnlLZXlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBjb3B5LnRhZ3MgPSB0aGlzLnRhZ3Muc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTY2hlbWEgfTtcbiIsImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQsIHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGluZGVudENvbW1lbnQsIGxpbmVDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5RG9jdW1lbnQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBsZXQgaGFzRGlyZWN0aXZlcyA9IG9wdGlvbnMuZGlyZWN0aXZlcyA9PT0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVzICE9PSBmYWxzZSAmJiBkb2MuZGlyZWN0aXZlcykge1xuICAgICAgICBjb25zdCBkaXIgPSBkb2MuZGlyZWN0aXZlcy50b1N0cmluZyhkb2MpO1xuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGRpcik7XG4gICAgICAgICAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaGFzRGlyZWN0aXZlcylcbiAgICAgICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgY29uc3QgY3R4ID0gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgY29tbWVudFN0cmluZyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKGRvYy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBsaW5lcy51bnNoaWZ0KCcnKTtcbiAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgbGluZXMudW5zaGlmdChpbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgIH1cbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IGNvbnRlbnRDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZG9jLmNvbnRlbnRzKSB7XG4gICAgICAgIGlmIChpc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5zcGFjZUJlZm9yZSAmJiBoYXNEaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgYmxvY2sgc2NhbGFycyBuZWVkIHRvIGJlIGluZGVudGVkIGlmIGZvbGxvd2VkIGJ5IGEgY29tbWVudFxuICAgICAgICAgICAgY3R4LmZvcmNlQmxvY2tJbmRlbnQgPSAhIWRvYy5jb21tZW50O1xuICAgICAgICAgICAgY29udGVudENvbW1lbnQgPSBkb2MuY29udGVudHMuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbkNob21wS2VlcCA9IGNvbnRlbnRDb21tZW50ID8gdW5kZWZpbmVkIDogKCkgPT4gKGNob21wS2VlcCA9IHRydWUpO1xuICAgICAgICBsZXQgYm9keSA9IHN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCwgKCkgPT4gKGNvbnRlbnRDb21tZW50ID0gbnVsbCksIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgaWYgKGNvbnRlbnRDb21tZW50KVxuICAgICAgICAgICAgYm9keSArPSBsaW5lQ29tbWVudChib2R5LCAnJywgY29tbWVudFN0cmluZyhjb250ZW50Q29tbWVudCkpO1xuICAgICAgICBpZiAoKGJvZHlbMF0gPT09ICd8JyB8fCBib2R5WzBdID09PSAnPicpICYmXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJy0tLScpIHtcbiAgICAgICAgICAgIC8vIFRvcC1sZXZlbCBibG9jayBzY2FsYXJzIHdpdGggYSBwcmVjZWRpbmcgZG9jIG1hcmtlciBvdWdodCB0byB1c2UgdGhlXG4gICAgICAgICAgICAvLyBzYW1lIGxpbmUgZm9yIHRoZWlyIGhlYWRlci5cbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID0gYC0tLSAke2JvZHl9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lcy5wdXNoKGJvZHkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnkoZG9jLmNvbnRlbnRzLCBjdHgpKTtcbiAgICB9XG4gICAgaWYgKGRvYy5kaXJlY3RpdmVzPy5kb2NFbmQpIHtcbiAgICAgICAgaWYgKGRvYy5jb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNzLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYC4uLiAke2NzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBkYyA9IGRvYy5jb21tZW50O1xuICAgICAgICBpZiAoZGMgJiYgY2hvbXBLZWVwKVxuICAgICAgICAgICAgZGMgPSBkYy5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICAgICAgaWYgKGRjKSB7XG4gICAgICAgICAgICBpZiAoKCFjaG9tcEtlZXAgfHwgY29udGVudENvbW1lbnQpICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdICE9PSAnJylcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGRjKSwgJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5RG9jdW1lbnQgfTtcbiIsImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgaXNFbXB0eVBhdGgsIGNvbGxlY3Rpb25Gcm9tUGF0aCB9IGZyb20gJy4uL25vZGVzL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgTk9ERV9UWVBFLCBET0MsIGlzTm9kZSwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIgfSBmcm9tICcuLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuLi9ub2Rlcy90b0pTLmpzJztcbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS9TY2hlbWEuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5RG9jdW1lbnQgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5RG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgYW5jaG9yTmFtZXMsIGZpbmROZXdBbmNob3IsIGNyZWF0ZU5vZGVBbmNob3JzIH0gZnJvbSAnLi9hbmNob3JzLmpzJztcbmltcG9ydCB7IGFwcGx5UmV2aXZlciB9IGZyb20gJy4vYXBwbHlSZXZpdmVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgRGlyZWN0aXZlcyB9IGZyb20gJy4vZGlyZWN0aXZlcy5qcyc7XG5cbmNsYXNzIERvY3VtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgLyoqIEEgY29tbWVudCBiZWZvcmUgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnRCZWZvcmUgPSBudWxsO1xuICAgICAgICAvKiogQSBjb21tZW50IGltbWVkaWF0ZWx5IGFmdGVyIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgLyoqIEVycm9ycyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLyoqIFdhcm5pbmdzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IERPQyB9KTtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnRBc0JpZ0ludDogZmFsc2UsXG4gICAgICAgICAgICBrZWVwU291cmNlVG9rZW5zOiBmYWxzZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICAgICAgICBwcmV0dHlFcnJvcnM6IHRydWUsXG4gICAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgICB1bmlxdWVLZXlzOiB0cnVlLFxuICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgbGV0IHsgdmVyc2lvbiB9ID0gb3B0O1xuICAgICAgICBpZiAob3B0aW9ucz8uX2RpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG9wdGlvbnMuX2RpcmVjdGl2ZXMuYXREb2N1bWVudCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcy55YW1sLmV4cGxpY2l0KVxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgdGhpcy5zZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIHRoaXMuY29udGVudHMgPVxuICAgICAgICAgICAgdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB0aGlzLmNyZWF0ZU5vZGUodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGRlZXAgY29weSBvZiB0aGlzIERvY3VtZW50IGFuZCBpdHMgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBDdXN0b20gTm9kZSB2YWx1ZXMgdGhhdCBpbmhlcml0IGZyb20gYE9iamVjdGAgc3RpbGwgcmVmZXIgdG8gdGhlaXIgb3JpZ2luYWwgaW5zdGFuY2VzLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShEb2N1bWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtOT0RFX1RZUEVdOiB7IHZhbHVlOiBET0MgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29weS5jb21tZW50QmVmb3JlID0gdGhpcy5jb21tZW50QmVmb3JlO1xuICAgICAgICBjb3B5LmNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG4gICAgICAgIGNvcHkuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoKTtcbiAgICAgICAgY29weS53YXJuaW5ncyA9IHRoaXMud2FybmluZ3Muc2xpY2UoKTtcbiAgICAgICAgY29weS5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgIGNvcHkuZGlyZWN0aXZlcyA9IHRoaXMuZGlyZWN0aXZlcy5jbG9uZSgpO1xuICAgICAgICBjb3B5LnNjaGVtYSA9IHRoaXMuc2NoZW1hLmNsb25lKCk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIGNvcHkuY29udGVudHMgPSBpc05vZGUodGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5jbG9uZShjb3B5LnNjaGVtYSlcbiAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGQodmFsdWUpO1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkSW4ocGF0aCwgdmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYEFsaWFzYCBub2RlLCBlbnN1cmluZyB0aGF0IHRoZSB0YXJnZXQgYG5vZGVgIGhhcyB0aGUgcmVxdWlyZWQgYW5jaG9yLlxuICAgICAqXG4gICAgICogSWYgYG5vZGVgIGFscmVhZHkgaGFzIGFuIGFuY2hvciwgYG5hbWVgIGlzIGlnbm9yZWQuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgYG5vZGUuYW5jaG9yYCB2YWx1ZSB3aWxsIGJlIHNldCB0byBgbmFtZWAsXG4gICAgICogb3IgaWYgYW4gYW5jaG9yIHdpdGggdGhhdCBuYW1lIGlzIGFscmVhZHkgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQsXG4gICAgICogYG5hbWVgIHdpbGwgYmUgdXNlZCBhcyBhIHByZWZpeCBmb3IgYSBuZXcgdW5pcXVlIGFuY2hvci5cbiAgICAgKiBJZiBgbmFtZWAgaXMgdW5kZWZpbmVkLCB0aGUgZ2VuZXJhdGVkIGFuY2hvciB3aWxsIHVzZSAnYScgYXMgYSBwcmVmaXguXG4gICAgICovXG4gICAgY3JlYXRlQWxpYXMobm9kZSwgbmFtZSkge1xuICAgICAgICBpZiAoIW5vZGUuYW5jaG9yKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2ID0gYW5jaG9yTmFtZXModGhpcyk7XG4gICAgICAgICAgICBub2RlLmFuY2hvciA9XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgICAgICAgICAgIW5hbWUgfHwgcHJldi5oYXMobmFtZSkgPyBmaW5kTmV3QW5jaG9yKG5hbWUgfHwgJ2EnLCBwcmV2KSA6IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBbGlhcyhub2RlLmFuY2hvcik7XG4gICAgfVxuICAgIGNyZWF0ZU5vZGUodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbCh7ICcnOiB2YWx1ZSB9LCAnJywgdmFsdWUpO1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVRvU3RyID0gKHYpID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJyB8fCB2IGluc3RhbmNlb2YgU3RyaW5nIHx8IHYgaW5zdGFuY2VvZiBOdW1iZXI7XG4gICAgICAgICAgICBjb25zdCBhc1N0ciA9IHJlcGxhY2VyLmZpbHRlcihrZXlUb1N0cikubWFwKFN0cmluZyk7XG4gICAgICAgICAgICBpZiAoYXNTdHIubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXBsYWNlciA9IHJlcGxhY2VyLmNvbmNhdChhc1N0cik7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgYWxpYXNEdXBsaWNhdGVPYmplY3RzLCBhbmNob3JQcmVmaXgsIGZsb3csIGtlZXBVbmRlZmluZWQsIG9uVGFnT2JqLCB0YWcgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgICAgIGNvbnN0IHsgb25BbmNob3IsIHNldEFuY2hvcnMsIHNvdXJjZU9iamVjdHMgfSA9IGNyZWF0ZU5vZGVBbmNob3JzKHRoaXMsIFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgYW5jaG9yUHJlZml4IHx8ICdhJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogYWxpYXNEdXBsaWNhdGVPYmplY3RzID8/IHRydWUsXG4gICAgICAgICAgICBrZWVwVW5kZWZpbmVkOiBrZWVwVW5kZWZpbmVkID8/IGZhbHNlLFxuICAgICAgICAgICAgb25BbmNob3IsXG4gICAgICAgICAgICBvblRhZ09iaixcbiAgICAgICAgICAgIHJlcGxhY2VyOiBfcmVwbGFjZXIsXG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMuc2NoZW1hLFxuICAgICAgICAgICAgc291cmNlT2JqZWN0c1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlTm9kZSh2YWx1ZSwgdGFnLCBjdHgpO1xuICAgICAgICBpZiAoZmxvdyAmJiBpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICBub2RlLmZsb3cgPSB0cnVlO1xuICAgICAgICBzZXRBbmNob3JzKCk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGEga2V5IGFuZCBhIHZhbHVlIGludG8gYSBgUGFpcmAgdXNpbmcgdGhlIGN1cnJlbnQgc2NoZW1hLFxuICAgICAqIHJlY3Vyc2l2ZWx5IHdyYXBwaW5nIGFsbCB2YWx1ZXMgYXMgYFNjYWxhcmAgb3IgYENvbGxlY3Rpb25gIG5vZGVzLlxuICAgICAqL1xuICAgIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGsgPSB0aGlzLmNyZWF0ZU5vZGUoa2V5LCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpcihrLCB2KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuZGVsZXRlKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlSW4ocGF0aCkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBQcmVzdW1lZCBpbXBvc3NpYmxlIGlmIFN0cmljdCBleHRlbmRzIGZhbHNlXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZGVsZXRlSW4ocGF0aClcbiAgICAgICAgICAgIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBga2V5YCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0KGtleSwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYHBhdGhgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy52YWx1ZVxuICAgICAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldEluKHBhdGgsIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhcyhrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSBhdCBgcGF0aGAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50cyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5oYXNJbihwYXRoKSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIFtrZXldLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgZG9jdW1lbnQuIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBBcnJheS5mcm9tKHBhdGgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXRJbihwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBZQU1MIHZlcnNpb24gYW5kIHNjaGVtYSB1c2VkIGJ5IHRoZSBkb2N1bWVudC5cbiAgICAgKiBBIGBudWxsYCB2ZXJzaW9uIGRpc2FibGVzIHN1cHBvcnQgZm9yIGRpcmVjdGl2ZXMsIGV4cGxpY2l0IHRhZ3MsIGFuY2hvcnMsIGFuZCBhbGlhc2VzLlxuICAgICAqIEl0IGFsc28gcmVxdWlyZXMgdGhlIGBzY2hlbWFgIG9wdGlvbiB0byBiZSBnaXZlbiBhcyBhIGBTY2hlbWFgIGluc3RhbmNlIHZhbHVlLlxuICAgICAqXG4gICAgICogT3ZlcnJpZGVzIGFsbCBwcmV2aW91c2x5IHNldCBzY2hlbWEgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBzZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICB2ZXJzaW9uID0gU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBsZXQgb3B0O1xuICAgICAgICBzd2l0Y2ggKHZlcnNpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJzEuMSc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9ICcxLjEnO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uOiAnMS4xJyB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IG1lcmdlOiB0cnVlLCByZXNvbHZlS25vd25UYWdzOiBmYWxzZSwgc2NoZW1hOiAneWFtbC0xLjEnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcxLjInOlxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb24gfSk7XG4gICAgICAgICAgICAgICAgb3B0ID0geyBtZXJnZTogZmFsc2UsIHJlc29sdmVLbm93blRhZ3M6IHRydWUsIHNjaGVtYTogJ2NvcmUnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlyZWN0aXZlcztcbiAgICAgICAgICAgICAgICBvcHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN2ID0gSlNPTi5zdHJpbmdpZnkodmVyc2lvbik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnMS4xJywgJzEuMicgb3IgbnVsbCBhcyBmaXJzdCBhcmd1bWVudCwgYnV0IGZvdW5kOiAke3N2fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5vdCB1c2luZyBgaW5zdGFuY2VvZiBTY2hlbWFgIHRvIGFsbG93IGZvciBkdWNrIHR5cGluZ1xuICAgICAgICBpZiAob3B0aW9ucy5zY2hlbWEgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG9wdGlvbnMuc2NoZW1hO1xuICAgICAgICBlbHNlIGlmIChvcHQpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG5ldyBTY2hlbWEoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaXRoIGEgbnVsbCBZQU1MIHZlcnNpb24sIHRoZSB7IHNjaGVtYTogU2NoZW1hIH0gb3B0aW9uIGlzIHJlcXVpcmVkYCk7XG4gICAgfVxuICAgIC8vIGpzb24gJiBqc29uQXJnIGFyZSBvbmx5IHVzZWQgZnJvbSB0b0pTT04oKVxuICAgIHRvSlMoeyBqc29uLCBqc29uQXJnLCBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYzogdGhpcyxcbiAgICAgICAgICAgIGtlZXA6ICFqc29uLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUyh0aGlzLmNvbnRlbnRzLCBqc29uQXJnID8/ICcnLCBjdHgpO1xuICAgICAgICBpZiAodHlwZW9mIG9uQW5jaG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvdW50LCByZXMgfSBvZiBjdHguYW5jaG9ycy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICBvbkFuY2hvcihyZXMsIGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50IGBjb250ZW50c2AuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ganNvbkFyZyBVc2VkIGJ5IGBKU09OLnN0cmluZ2lmeWAgdG8gaW5kaWNhdGUgdGhlIGFycmF5IGluZGV4IG9yXG4gICAgICogICBwcm9wZXJ0eSBuYW1lLlxuICAgICAqL1xuICAgIHRvSlNPTihqc29uQXJnLCBvbkFuY2hvcikge1xuICAgICAgICByZXR1cm4gdGhpcy50b0pTKHsganNvbjogdHJ1ZSwganNvbkFyZywgbWFwQXNNYXA6IGZhbHNlLCBvbkFuY2hvciB9KTtcbiAgICB9XG4gICAgLyoqIEEgWUFNTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQuICovXG4gICAgdG9TdHJpbmcob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2N1bWVudCB3aXRoIGVycm9ycyBjYW5ub3QgYmUgc3RyaW5naWZpZWQnKTtcbiAgICAgICAgaWYgKCdpbmRlbnQnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgICAgICghTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmluZGVudCkgfHwgTnVtYmVyKG9wdGlvbnMuaW5kZW50KSA8PSAwKSkge1xuICAgICAgICAgICAgY29uc3QgcyA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuaW5kZW50KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCJpbmRlbnRcIiBvcHRpb24gbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIG5vdCAke3N9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeURvY3VtZW50KHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzc2VydENvbGxlY3Rpb24oY29udGVudHMpIHtcbiAgICBpZiAoaXNDb2xsZWN0aW9uKGNvbnRlbnRzKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIFlBTUwgY29sbGVjdGlvbiBhcyBkb2N1bWVudCBjb250ZW50cycpO1xufVxuXG5leHBvcnQgeyBEb2N1bWVudCB9O1xuIiwiY2xhc3MgWUFNTEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICB9XG59XG5jbGFzcyBZQU1MUGFyc2VFcnJvciBleHRlbmRzIFlBTUxFcnJvciB7XG4gICAgY29uc3RydWN0b3IocG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCdZQU1MUGFyc2VFcnJvcicsIHBvcywgY29kZSwgbWVzc2FnZSk7XG4gICAgfVxufVxuY2xhc3MgWUFNTFdhcm5pbmcgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFdhcm5pbmcnLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNvbnN0IHByZXR0aWZ5RXJyb3IgPSAoc3JjLCBsYykgPT4gKGVycm9yKSA9PiB7XG4gICAgaWYgKGVycm9yLnBvc1swXSA9PT0gLTEpXG4gICAgICAgIHJldHVybjtcbiAgICBlcnJvci5saW5lUG9zID0gZXJyb3IucG9zLm1hcChwb3MgPT4gbGMubGluZVBvcyhwb3MpKTtcbiAgICBjb25zdCB7IGxpbmUsIGNvbCB9ID0gZXJyb3IubGluZVBvc1swXTtcbiAgICBlcnJvci5tZXNzYWdlICs9IGAgYXQgbGluZSAke2xpbmV9LCBjb2x1bW4gJHtjb2x9YDtcbiAgICBsZXQgY2kgPSBjb2wgLSAxO1xuICAgIGxldCBsaW5lU3RyID0gc3JjXG4gICAgICAgIC5zdWJzdHJpbmcobGMubGluZVN0YXJ0c1tsaW5lIC0gMV0sIGxjLmxpbmVTdGFydHNbbGluZV0pXG4gICAgICAgIC5yZXBsYWNlKC9bXFxuXFxyXSskLywgJycpO1xuICAgIC8vIFRyaW0gdG8gbWF4IDgwIGNoYXJzLCBrZWVwaW5nIGNvbCBwb3NpdGlvbiBuZWFyIHRoZSBtaWRkbGVcbiAgICBpZiAoY2kgPj0gNjAgJiYgbGluZVN0ci5sZW5ndGggPiA4MCkge1xuICAgICAgICBjb25zdCB0cmltU3RhcnQgPSBNYXRoLm1pbihjaSAtIDM5LCBsaW5lU3RyLmxlbmd0aCAtIDc5KTtcbiAgICAgICAgbGluZVN0ciA9ICfigKYnICsgbGluZVN0ci5zdWJzdHJpbmcodHJpbVN0YXJ0KTtcbiAgICAgICAgY2kgLT0gdHJpbVN0YXJ0IC0gMTtcbiAgICB9XG4gICAgaWYgKGxpbmVTdHIubGVuZ3RoID4gODApXG4gICAgICAgIGxpbmVTdHIgPSBsaW5lU3RyLnN1YnN0cmluZygwLCA3OSkgKyAn4oCmJztcbiAgICAvLyBJbmNsdWRlIHByZXZpb3VzIGxpbmUgaW4gY29udGV4dCBpZiBwb2ludGluZyBhdCBsaW5lIHN0YXJ0XG4gICAgaWYgKGxpbmUgPiAxICYmIC9eICokLy50ZXN0KGxpbmVTdHIuc3Vic3RyaW5nKDAsIGNpKSkpIHtcbiAgICAgICAgLy8gUmVnZXhwIHdvbid0IG1hdGNoIGlmIHN0YXJ0IGlzIHRyaW1tZWRcbiAgICAgICAgbGV0IHByZXYgPSBzcmMuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDJdLCBsYy5saW5lU3RhcnRzW2xpbmUgLSAxXSk7XG4gICAgICAgIGlmIChwcmV2Lmxlbmd0aCA+IDgwKVxuICAgICAgICAgICAgcHJldiA9IHByZXYuc3Vic3RyaW5nKDAsIDc5KSArICfigKZcXG4nO1xuICAgICAgICBsaW5lU3RyID0gcHJldiArIGxpbmVTdHI7XG4gICAgfVxuICAgIGlmICgvW14gXS8udGVzdChsaW5lU3RyKSkge1xuICAgICAgICBsZXQgY291bnQgPSAxO1xuICAgICAgICBjb25zdCBlbmQgPSBlcnJvci5saW5lUG9zWzFdO1xuICAgICAgICBpZiAoZW5kICYmIGVuZC5saW5lID09PSBsaW5lICYmIGVuZC5jb2wgPiBjb2wpIHtcbiAgICAgICAgICAgIGNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oZW5kLmNvbCAtIGNvbCwgODAgLSBjaSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSAnICcucmVwZWF0KGNpKSArICdeJy5yZXBlYXQoY291bnQpO1xuICAgICAgICBlcnJvci5tZXNzYWdlICs9IGA6XFxuXFxuJHtsaW5lU3RyfVxcbiR7cG9pbnRlcn1cXG5gO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IFlBTUxFcnJvciwgWUFNTFBhcnNlRXJyb3IsIFlBTUxXYXJuaW5nLCBwcmV0dGlmeUVycm9yIH07XG4iLCJmdW5jdGlvbiByZXNvbHZlUHJvcHModG9rZW5zLCB7IGZsb3csIGluZGljYXRvciwgbmV4dCwgb2Zmc2V0LCBvbkVycm9yLCBzdGFydE9uTmV3bGluZSB9KSB7XG4gICAgbGV0IHNwYWNlQmVmb3JlID0gZmFsc2U7XG4gICAgbGV0IGF0TmV3bGluZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBoYXNTcGFjZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGNvbW1lbnRTZXAgPSAnJztcbiAgICBsZXQgaGFzTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCBoYXNOZXdsaW5lQWZ0ZXJQcm9wID0gZmFsc2U7XG4gICAgbGV0IHJlcVNwYWNlID0gZmFsc2U7XG4gICAgbGV0IGFuY2hvciA9IG51bGw7XG4gICAgbGV0IHRhZyA9IG51bGw7XG4gICAgbGV0IGNvbW1hID0gbnVsbDtcbiAgICBsZXQgZm91bmQgPSBudWxsO1xuICAgIGxldCBzdGFydCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgaWYgKHJlcVNwYWNlKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICdjb21tYScpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgICAgICAgICByZXFTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoZSBkb2MgbGV2ZWwsIHRhYnMgYXQgbGluZSBzdGFydCBtYXkgYmUgcGFyc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgbGVhZGluZyB3aGl0ZSBzcGFjZSByYXRoZXIgdGhhbiBpbmRlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJbiBhIGZsb3cgY29sbGVjdGlvbiwgb25seSB0aGUgcGFyc2VyIGhhbmRsZXMgaW5kZW50LlxuICAgICAgICAgICAgICAgIGlmICghZmxvdyAmJlxuICAgICAgICAgICAgICAgICAgICBhdE5ld2xpbmUgJiZcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yICE9PSAnZG9jLXN0YXJ0JyAmJlxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5zb3VyY2VbMF0gPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJztcbiAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gY29tbWVudFNlcCArIGNiO1xuICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgPSAnJztcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChhdE5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGFzTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIGhhc05ld2xpbmVBZnRlclByb3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01VTFRJUExFX0FOQ0hPUlMnLCAnQSBub2RlIGNhbiBoYXZlIGF0IG1vc3Qgb25lIGFuY2hvcicpO1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbi5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbmNob3IgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYW5jaG9yID0gdG9rZW47XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IHRva2VuLm9mZnNldDtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6IHtcbiAgICAgICAgICAgICAgICBpZiAodGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfVEFHUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgdGFnJyk7XG4gICAgICAgICAgICAgICAgdGFnID0gdG9rZW47XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IHRva2VuLm9mZnNldDtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgaW5kaWNhdG9yOlxuICAgICAgICAgICAgICAgIC8vIENvdWxkIGhlcmUgaGFuZGxlIHByZWNlZGluZyBjb21tZW50cyBkaWZmZXJlbnRseVxuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnQkFEX1BST1BfT1JERVInLCBgQW5jaG9ycyBhbmQgdGFncyBtdXN0IGJlIGFmdGVyIHRoZSAke3Rva2VuLnNvdXJjZX0gaW5kaWNhdG9yYCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4uc291cmNlfSBpbiAke2Zsb3cgPz8gJ2NvbGxlY3Rpb24nfWApO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdG9rZW47XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICBpZiAoZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWEpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmbG93fWApO1xuICAgICAgICAgICAgICAgICAgICBjb21tYSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4udHlwZX0gdG9rZW5gKTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGVuZCA9IGxhc3QgPyBsYXN0Lm9mZnNldCArIGxhc3Quc291cmNlLmxlbmd0aCA6IG9mZnNldDtcbiAgICBpZiAocmVxU3BhY2UgJiZcbiAgICAgICAgbmV4dCAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICdzcGFjZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnbmV3bGluZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnY29tbWEnICYmXG4gICAgICAgIChuZXh0LnR5cGUgIT09ICdzY2FsYXInIHx8IG5leHQuc291cmNlICE9PSAnJykpXG4gICAgICAgIG9uRXJyb3IobmV4dC5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWEsXG4gICAgICAgIGZvdW5kLFxuICAgICAgICBzcGFjZUJlZm9yZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgaGFzTmV3bGluZSxcbiAgICAgICAgaGFzTmV3bGluZUFmdGVyUHJvcCxcbiAgICAgICAgYW5jaG9yLFxuICAgICAgICB0YWcsXG4gICAgICAgIGVuZCxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0ID8/IGVuZFxuICAgIH07XG59XG5cbmV4cG9ydCB7IHJlc29sdmVQcm9wcyB9O1xuIiwiZnVuY3Rpb24gY29udGFpbnNOZXdsaW5lKGtleSkge1xuICAgIGlmICgha2V5KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBzd2l0Y2ggKGtleS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBpZiAoa2V5LnNvdXJjZS5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5LmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGtleS5lbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2Yga2V5Lml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNOZXdsaW5lKGl0LmtleSkgfHwgY29udGFpbnNOZXdsaW5lKGl0LnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9O1xuIiwiaW1wb3J0IHsgY29udGFpbnNOZXdsaW5lIH0gZnJvbSAnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnO1xuXG5mdW5jdGlvbiBmbG93SW5kZW50Q2hlY2soaW5kZW50LCBmYywgb25FcnJvcikge1xuICAgIGlmIChmYz8udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgY29uc3QgZW5kID0gZmMuZW5kWzBdO1xuICAgICAgICBpZiAoZW5kLmluZGVudCA9PT0gaW5kZW50ICYmXG4gICAgICAgICAgICAoZW5kLnNvdXJjZSA9PT0gJ10nIHx8IGVuZC5zb3VyY2UgPT09ICd9JykgJiZcbiAgICAgICAgICAgIGNvbnRhaW5zTmV3bGluZShmYykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdGbG93IGVuZCBpbmRpY2F0b3Igc2hvdWxkIGJlIG1vcmUgaW5kZW50ZWQgdGhhbiBwYXJlbnQnO1xuICAgICAgICAgICAgb25FcnJvcihlbmQsICdCQURfSU5ERU5UJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgZmxvd0luZGVudENoZWNrIH07XG4iLCJpbXBvcnQgeyBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcblxuZnVuY3Rpb24gbWFwSW5jbHVkZXMoY3R4LCBpdGVtcywgc2VhcmNoKSB7XG4gICAgY29uc3QgeyB1bmlxdWVLZXlzIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAodW5pcXVlS2V5cyA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpc0VxdWFsID0gdHlwZW9mIHVuaXF1ZUtleXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB1bmlxdWVLZXlzXG4gICAgICAgIDogKGEsIGIpID0+IGEgPT09IGIgfHxcbiAgICAgICAgICAgIChpc1NjYWxhcihhKSAmJlxuICAgICAgICAgICAgICAgIGlzU2NhbGFyKGIpICYmXG4gICAgICAgICAgICAgICAgYS52YWx1ZSA9PT0gYi52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICEoYS52YWx1ZSA9PT0gJzw8JyAmJiBjdHguc2NoZW1hLm1lcmdlKSk7XG4gICAgcmV0dXJuIGl0ZW1zLnNvbWUocGFpciA9PiBpc0VxdWFsKHBhaXIua2V5LCBzZWFyY2gpKTtcbn1cblxuZXhwb3J0IHsgbWFwSW5jbHVkZXMgfTtcbiIsImltcG9ydCB7IFBhaXIgfSBmcm9tICcuLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5pbXBvcnQgeyBjb250YWluc05ld2xpbmUgfSBmcm9tICcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyc7XG5pbXBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfSBmcm9tICcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnO1xuaW1wb3J0IHsgbWFwSW5jbHVkZXMgfSBmcm9tICcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJztcblxuY29uc3Qgc3RhcnRDb2xNc2cgPSAnQWxsIG1hcHBpbmcgaXRlbXMgbXVzdCBzdGFydCBhdCB0aGUgc2FtZSBjb2x1bW4nO1xuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrTWFwKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBibSwgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTE1hcDtcbiAgICBjb25zdCBtYXAgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJtLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCBjb2xsSXRlbSBvZiBibS5pdGVtcykge1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICAvLyBrZXkgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBrZXlQcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGltcGxpY2l0S2V5ID0gIWtleVByb3BzLmZvdW5kO1xuICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JMT0NLX0FTX0lNUExJQ0lUX0tFWScsICdBIGJsb2NrIHNlcXVlbmNlIG1heSBub3QgYmUgdXNlZCBhcyBhbiBpbXBsaWNpdCBtYXAga2V5Jyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoJ2luZGVudCcgaW4ga2V5ICYmIGtleS5pbmRlbnQgIT09IGJtLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFrZXlQcm9wcy5hbmNob3IgJiYgIWtleVByb3BzLnRhZyAmJiAhc2VwKSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAoa2V5UHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCArPSAnXFxuJyArIGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ID0ga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5UHJvcHMuaGFzTmV3bGluZUFmdGVyUHJvcCB8fCBjb250YWluc05ld2xpbmUoa2V5KSkge1xuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5ID8/IHN0YXJ0W3N0YXJ0Lmxlbmd0aCAtIDFdLCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleVByb3BzLmZvdW5kPy5pbmRlbnQgIT09IGJtLmluZGVudCkge1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICBjb25zdCBrZXlTdGFydCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwga2V5UHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBrZXlTdGFydCwgc3RhcnQsIG51bGwsIGtleVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgZmxvd0luZGVudENoZWNrKGJtLmluZGVudCwga2V5LCBvbkVycm9yKTtcbiAgICAgICAgaWYgKG1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgdmFsdWVQcm9wcyA9IHJlc29sdmVQcm9wcyhzZXAgPz8gW10sIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ21hcC12YWx1ZS1pbmQnLFxuICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICBvZmZzZXQ6IGtleU5vZGUucmFuZ2VbMl0sXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6ICFrZXkgfHwga2V5LnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgIH0pO1xuICAgICAgICBvZmZzZXQgPSB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiYgIXZhbHVlUHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnTmVzdGVkIG1hcHBpbmdzIGFyZSBub3QgYWxsb3dlZCBpbiBjb21wYWN0IG1hcHBpbmdzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnN0cmljdCAmJlxuICAgICAgICAgICAgICAgICAgICBrZXlQcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGJsb2NrIG1hcHBpbmcga2V5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBrZXkgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ01JU1NJTkdfQ0hBUicsICdJbXBsaWNpdCBtYXAga2V5cyBuZWVkIHRvIGJlIGZvbGxvd2VkIGJ5IG1hcCB2YWx1ZXMnKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudEVuZCAmJiBjb21tZW50RW5kIDwgb2Zmc2V0KVxuICAgICAgICBvbkVycm9yKGNvbW1lbnRFbmQsICdJTVBPU1NJQkxFJywgJ01hcCBjb21tZW50IHdpdGggdHJhaWxpbmcgY29udGVudCcpO1xuICAgIG1hcC5yYW5nZSA9IFtibS5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja01hcCB9O1xuIiwiaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVByb3BzIH0gZnJvbSAnLi9yZXNvbHZlLXByb3BzLmpzJztcbmltcG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9IGZyb20gJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NlcSh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYnMsIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxTZXE7XG4gICAgY29uc3Qgc2VxID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBpZiAoY3R4LmF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBicy5vZmZzZXQ7XG4gICAgbGV0IGNvbW1lbnRFbmQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgeyBzdGFydCwgdmFsdWUgfSBvZiBicy5pdGVtcykge1xuICAgICAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnc2VxLWl0ZW0taW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yIHx8IHByb3BzLnRhZyB8fCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5lbmQsICdCQURfSU5ERU5UJywgJ0FsbCBzZXF1ZW5jZSBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbicpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnU2VxdWVuY2UgaXRlbSB3aXRob3V0IC0gaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21tZW50RW5kID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBzZXEuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm9kZSA9IHZhbHVlXG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICBmbG93SW5kZW50Q2hlY2soYnMuaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgIG9mZnNldCA9IG5vZGUucmFuZ2VbMl07XG4gICAgICAgIHNlcS5pdGVtcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgICBzZXEucmFuZ2UgPSBbYnMub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gc2VxO1xufVxuXG5leHBvcnQgeyByZXNvbHZlQmxvY2tTZXEgfTtcbiIsImZ1bmN0aW9uIHJlc29sdmVFbmQoZW5kLCBvZmZzZXQsIHJlcVNwYWNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICBsZXQgc2VwID0gJyc7XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgZW5kKSB7XG4gICAgICAgICAgICBjb25zdCB7IHNvdXJjZSwgdHlwZSB9ID0gdG9rZW47XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcVNwYWNlICYmICFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY2I7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gc2VwICsgY2I7XG4gICAgICAgICAgICAgICAgICAgIHNlcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VwICs9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dHlwZX0gYXQgbm9kZSBlbmRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIG9mZnNldCB9O1xufVxuXG5leHBvcnQgeyByZXNvbHZlRW5kIH07XG4iLCJpbXBvcnQgeyBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuaW1wb3J0IHsgY29udGFpbnNOZXdsaW5lIH0gZnJvbSAnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnO1xuaW1wb3J0IHsgbWFwSW5jbHVkZXMgfSBmcm9tICcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJztcblxuY29uc3QgYmxvY2tNc2cgPSAnQmxvY2sgY29sbGVjdGlvbnMgYXJlIG5vdCBhbGxvd2VkIHdpdGhpbiBmbG93IGNvbGxlY3Rpb25zJztcbmNvbnN0IGlzQmxvY2sgPSAodG9rZW4pID0+IHRva2VuICYmICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJyk7XG5mdW5jdGlvbiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGZjLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBpc01hcCA9IGZjLnN0YXJ0LnNvdXJjZSA9PT0gJ3snO1xuICAgIGNvbnN0IGZjTmFtZSA9IGlzTWFwID8gJ2Zsb3cgbWFwJyA6ICdmbG93IHNlcXVlbmNlJztcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSAodGFnPy5ub2RlQ2xhc3MgPz8gKGlzTWFwID8gWUFNTE1hcCA6IFlBTUxTZXEpKTtcbiAgICBjb25zdCBjb2xsID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBjb2xsLmZsb3cgPSB0cnVlO1xuICAgIGNvbnN0IGF0Um9vdCA9IGN0eC5hdFJvb3Q7XG4gICAgaWYgKGF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBmYy5vZmZzZXQgKyBmYy5zdGFydC5zb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmMuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY29sbEl0ZW0gPSBmYy5pdGVtc1tpXTtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5hbmNob3IgJiYgIXByb3BzLnRhZyAmJiAhc2VwICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAwICYmIHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaSA8IGZjLml0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgZW1wdHkgaXRlbSBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ICs9ICdcXG4nICsgcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc01hcCAmJiBjdHgub3B0aW9ucy5zdHJpY3QgJiYgY29udGFpbnNOZXdsaW5lKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXksIC8vIGNoZWNrZWQgYnkgY29udGFpbnNOZXdsaW5lKClcbiAgICAgICAgICAgICAgICAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGxldCBwcmV2SXRlbUNvbW1lbnQgPSAnJztcbiAgICAgICAgICAgICAgICBsb29wOiBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW1Db21tZW50ID0gc3Quc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbUNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSBjb2xsLml0ZW1zW2NvbGwuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1BhaXIocHJldikpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcHJldi52YWx1ZSA/PyBwcmV2LmtleTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCArPSAnXFxuJyArIHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ID0gcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jb21tZW50ID0gcHJvcHMuY29tbWVudC5zdWJzdHJpbmcocHJldkl0ZW1Db21tZW50Lmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTWFwICYmICFzZXAgJiYgIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEgdmFsdWUgaW4gYSBzZXFcbiAgICAgICAgICAgIC8vIOKGkiBrZXkgJiBzZXAgYXJlIGVtcHR5LCBzdGFydCBkb2VzIG5vdCBpbmNsdWRlID8gb3IgOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc2VwLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2godmFsdWVOb2RlKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEga2V5K3ZhbHVlIHBhaXJcbiAgICAgICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoaXNCbG9jayhrZXkpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGtleU5vZGUucmFuZ2VbMl0sXG4gICAgICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTWFwICYmICFwcm9wcy5mb3VuZCAmJiBjdHgub3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2Ygc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ID09PSB2YWx1ZVByb3BzLmZvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioc3QsICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuZm91bmQsICdLRVlfT1ZFUl8xMDI0X0NIQVJTJywgJ1RoZSA6IGluZGljYXRvciBtdXN0IGJlIGF0IG1vc3QgMTAyNCBjaGFycyBhZnRlciB0aGUgc3RhcnQgb2YgYW4gaW1wbGljaXQgZmxvdyBzZXF1ZW5jZSBrZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc291cmNlJyBpbiB2YWx1ZSAmJiB2YWx1ZS5zb3VyY2UgJiYgdmFsdWUuc291cmNlWzBdID09PSAnOicpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWUsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyBzcGFjZSBhZnRlciA6IGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLnN0YXJ0LCAnTUlTU0lOR19DSEFSJywgYE1pc3NpbmcgLCBvciA6IGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiB2YWx1ZVByb3BzLmZvdW5kXG4gICAgICAgICAgICAgICAgICAgID8gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHZhbHVlUHJvcHMuZW5kLCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICAgIGlmICh2YWx1ZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCbG9jayh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlUHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChrZXlOb2RlLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCArPSAnXFxuJyArIHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCA9IHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgaWYgKGlzTWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gY29sbDtcbiAgICAgICAgICAgICAgICBpZiAobWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IFlBTUxNYXAoY3R4LnNjaGVtYSk7XG4gICAgICAgICAgICAgICAgbWFwLmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgICAgIGNvbGwuaXRlbXMucHVzaChtYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlID8gdmFsdWVOb2RlLnJhbmdlWzJdIDogdmFsdWVQcm9wcy5lbmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXhwZWN0ZWRFbmQgPSBpc01hcCA/ICd9JyA6ICddJztcbiAgICBjb25zdCBbY2UsIC4uLmVlXSA9IGZjLmVuZDtcbiAgICBsZXQgY2VQb3MgPSBvZmZzZXQ7XG4gICAgaWYgKGNlICYmIGNlLnNvdXJjZSA9PT0gZXhwZWN0ZWRFbmQpXG4gICAgICAgIGNlUG9zID0gY2Uub2Zmc2V0ICsgY2Uuc291cmNlLmxlbmd0aDtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGZjTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZmNOYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbXNnID0gYXRSb290XG4gICAgICAgICAgICA/IGAke25hbWV9IG11c3QgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWBcbiAgICAgICAgICAgIDogYCR7bmFtZX0gaW4gYmxvY2sgY29sbGVjdGlvbiBtdXN0IGJlIHN1ZmZpY2llbnRseSBpbmRlbnRlZCBhbmQgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWA7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBhdFJvb3QgPyAnTUlTU0lOR19DSEFSJyA6ICdCQURfSU5ERU5UJywgbXNnKTtcbiAgICAgICAgaWYgKGNlICYmIGNlLnNvdXJjZS5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBlZS51bnNoaWZ0KGNlKTtcbiAgICB9XG4gICAgaWYgKGVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZChlZSwgY2VQb3MsIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBlbmQuY29tbWVudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBlbmQuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGVuZC5vZmZzZXRdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29sbC5yYW5nZSA9IFtmYy5vZmZzZXQsIGNlUG9zLCBjZVBvc107XG4gICAgfVxuICAgIHJldHVybiBjb2xsO1xufVxuXG5leHBvcnQgeyByZXNvbHZlRmxvd0NvbGxlY3Rpb24gfTtcbiIsImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tNYXAgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stbWFwLmpzJztcbmltcG9ydCB7IHJlc29sdmVCbG9ja1NlcSB9IGZyb20gJy4vcmVzb2x2ZS1ibG9jay1zZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUZsb3dDb2xsZWN0aW9uIH0gZnJvbSAnLi9yZXNvbHZlLWZsb3ctY29sbGVjdGlvbi5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lLCB0YWcpIHtcbiAgICBjb25zdCBjb2xsID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyByZXNvbHZlQmxvY2tNYXAoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyByZXNvbHZlQmxvY2tTZXEoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgICAgIDogcmVzb2x2ZUZsb3dDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpO1xuICAgIGNvbnN0IENvbGwgPSBjb2xsLmNvbnN0cnVjdG9yO1xuICAgIC8vIElmIHdlIGdvdCBhIHRhZ05hbWUgbWF0Y2hpbmcgdGhlIGNsYXNzLCBvciB0aGUgdGFnIG5hbWUgaXMgJyEnLFxuICAgIC8vIHRoZW4gdXNlIHRoZSB0YWdOYW1lIGZyb20gdGhlIG5vZGUgY2xhc3MgdXNlZCB0byBjcmVhdGUgaXQuXG4gICAgaWYgKHRhZ05hbWUgPT09ICchJyB8fCB0YWdOYW1lID09PSBDb2xsLnRhZ05hbWUpIHtcbiAgICAgICAgY29sbC50YWcgPSBDb2xsLnRhZ05hbWU7XG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIH1cbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgY29sbC50YWcgPSB0YWdOYW1lO1xuICAgIHJldHVybiBjb2xsO1xufVxuZnVuY3Rpb24gY29tcG9zZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9ICF0YWdUb2tlblxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBjdHguZGlyZWN0aXZlcy50YWdOYW1lKHRhZ1Rva2VuLnNvdXJjZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpKTtcbiAgICBjb25zdCBleHBUeXBlID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyAnbWFwJ1xuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/ICdzZXEnXG4gICAgICAgICAgICA6IHRva2VuLnN0YXJ0LnNvdXJjZSA9PT0gJ3snXG4gICAgICAgICAgICAgICAgPyAnbWFwJ1xuICAgICAgICAgICAgICAgIDogJ3NlcSc7XG4gICAgLy8gc2hvcnRjdXQ6IGNoZWNrIGlmIGl0J3MgYSBnZW5lcmljIFlBTUxNYXAgb3IgWUFNTFNlcVxuICAgIC8vIGJlZm9yZSBqdW1waW5nIGludG8gdGhlIGN1c3RvbSB0YWcgbG9naWMuXG4gICAgaWYgKCF0YWdUb2tlbiB8fFxuICAgICAgICAhdGFnTmFtZSB8fFxuICAgICAgICB0YWdOYW1lID09PSAnIScgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxNYXAudGFnTmFtZSAmJiBleHBUeXBlID09PSAnbWFwJykgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxTZXEudGFnTmFtZSAmJiBleHBUeXBlID09PSAnc2VxJykgfHxcbiAgICAgICAgIWV4cFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICB9XG4gICAgbGV0IHRhZyA9IGN0eC5zY2hlbWEudGFncy5maW5kKHQgPT4gdC50YWcgPT09IHRhZ05hbWUgJiYgdC5jb2xsZWN0aW9uID09PSBleHBUeXBlKTtcbiAgICBpZiAoIXRhZykge1xuICAgICAgICBjb25zdCBrdCA9IGN0eC5zY2hlbWEua25vd25UYWdzW3RhZ05hbWVdO1xuICAgICAgICBpZiAoa3QgJiYga3QuY29sbGVjdGlvbiA9PT0gZXhwVHlwZSkge1xuICAgICAgICAgICAgY3R4LnNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UgfSkpO1xuICAgICAgICAgICAgdGFnID0ga3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoa3Q/LmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnQkFEX0NPTExFQ1RJT05fVFlQRScsIGAke2t0LnRhZ30gdXNlZCBmb3IgJHtleHBUeXBlfSBjb2xsZWN0aW9uLCBidXQgZXhwZWN0cyAke2t0LmNvbGxlY3Rpb259YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgYFVucmVzb2x2ZWQgdGFnOiAke3RhZ05hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGNvbGwgPSByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKTtcbiAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZT8uKGNvbGwsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpID8/IGNvbGw7XG4gICAgY29uc3Qgbm9kZSA9IGlzTm9kZShyZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogbmV3IFNjYWxhcihyZXMpO1xuICAgIG5vZGUucmFuZ2UgPSBjb2xsLnJhbmdlO1xuICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnPy5mb3JtYXQpXG4gICAgICAgIG5vZGUuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IHsgY29tcG9zZUNvbGxlY3Rpb24gfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NjYWxhcihzY2FsYXIsIHN0cmljdCwgb25FcnJvcikge1xuICAgIGNvbnN0IHN0YXJ0ID0gc2NhbGFyLm9mZnNldDtcbiAgICBjb25zdCBoZWFkZXIgPSBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHNjYWxhciwgc3RyaWN0LCBvbkVycm9yKTtcbiAgICBpZiAoIWhlYWRlcilcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6ICcnLCB0eXBlOiBudWxsLCBjb21tZW50OiAnJywgcmFuZ2U6IFtzdGFydCwgc3RhcnQsIHN0YXJ0XSB9O1xuICAgIGNvbnN0IHR5cGUgPSBoZWFkZXIubW9kZSA9PT0gJz4nID8gU2NhbGFyLkJMT0NLX0ZPTERFRCA6IFNjYWxhci5CTE9DS19MSVRFUkFMO1xuICAgIGNvbnN0IGxpbmVzID0gc2NhbGFyLnNvdXJjZSA/IHNwbGl0TGluZXMoc2NhbGFyLnNvdXJjZSkgOiBbXTtcbiAgICAvLyBkZXRlcm1pbmUgdGhlIGVuZCBvZiBjb250ZW50ICYgc3RhcnQgb2YgY2hvbXBpbmdcbiAgICBsZXQgY2hvbXBTdGFydCA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGxpbmVzW2ldWzFdO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpXG4gICAgICAgICAgICBjaG9tcFN0YXJ0ID0gaTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIHNob3J0Y3V0IGZvciBlbXB0eSBjb250ZW50c1xuICAgIGlmIChjaG9tcFN0YXJ0ID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZGVyLmNob21wID09PSAnKycgJiYgbGluZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyAnXFxuJy5yZXBlYXQoTWF0aC5tYXgoMSwgbGluZXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyBoZWFkZXIubGVuZ3RoO1xuICAgICAgICBpZiAoc2NhbGFyLnNvdXJjZSlcbiAgICAgICAgICAgIGVuZCArPSBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQ6IGhlYWRlci5jb21tZW50LCByYW5nZTogW3N0YXJ0LCBlbmQsIGVuZF0gfTtcbiAgICB9XG4gICAgLy8gZmluZCB0aGUgaW5kZW50YXRpb24gbGV2ZWwgdG8gdHJpbSBmcm9tIHN0YXJ0XG4gICAgbGV0IHRyaW1JbmRlbnQgPSBzY2FsYXIuaW5kZW50ICsgaGVhZGVyLmluZGVudDtcbiAgICBsZXQgb2Zmc2V0ID0gc2NhbGFyLm9mZnNldCArIGhlYWRlci5sZW5ndGg7XG4gICAgbGV0IGNvbnRlbnRTdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgY29uc3QgW2luZGVudCwgY29udGVudF0gPSBsaW5lc1tpXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKSB7XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMCAmJiBpbmRlbnQubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFycyB3aXRoIG1vcmUtaW5kZW50ZWQgbGVhZGluZyBlbXB0eSBsaW5lcyBtdXN0IHVzZSBhbiBleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgaW5kZW50Lmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDApXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgICAgICBjb250ZW50U3RhcnQgPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgfVxuICAgIC8vIGluY2x1ZGUgdHJhaWxpbmcgbW9yZS1pbmRlbnRlZCBlbXB0eSBsaW5lcyBpbiBjb250ZW50XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gY2hvbXBTdGFydDsgLS1pKSB7XG4gICAgICAgIGlmIChsaW5lc1tpXVswXS5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGkgKyAxO1xuICAgIH1cbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBsZXQgc2VwID0gJyc7XG4gICAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAvLyBsZWFkaW5nIHdoaXRlc3BhY2UgaXMga2VwdCBpbnRhY3RcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRTdGFydDsgKytpKVxuICAgICAgICB2YWx1ZSArPSBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KSArICdcXG4nO1xuICAgIGZvciAobGV0IGkgPSBjb250ZW50U3RhcnQ7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgbGV0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgICAgICBjb25zdCBjcmxmID0gY29udGVudFtjb250ZW50Lmxlbmd0aCAtIDFdID09PSAnXFxyJztcbiAgICAgICAgaWYgKGNybGYpXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgwLCAtMSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBhbHJlYWR5IGNhdWdodCBpbiBsZXhlciAqL1xuICAgICAgICBpZiAoY29udGVudCAmJiBpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gaGVhZGVyLmluZGVudFxuICAgICAgICAgICAgICAgID8gJ2V4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcidcbiAgICAgICAgICAgICAgICA6ICdmaXJzdCBsaW5lJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgQmxvY2sgc2NhbGFyIGxpbmVzIG11c3Qgbm90IGJlIGxlc3MgaW5kZW50ZWQgdGhhbiB0aGVpciAke3NyY31gO1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgLSBjb250ZW50Lmxlbmd0aCAtIChjcmxmID8gMiA6IDEpLCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMKSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQgfHwgY29udGVudFswXSA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIG1vcmUtaW5kZW50ZWQgY29udGVudCB3aXRoaW4gYSBmb2xkZWQgYmxvY2tcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICcgJylcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFwcmV2TW9yZUluZGVudGVkICYmIHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcblxcbic7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBwcmV2TW9yZUluZGVudGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb250ZW50ID09PSAnJykge1xuICAgICAgICAgICAgLy8gZW1wdHkgbGluZVxuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoaGVhZGVyLmNob21wKSB7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNob21wU3RhcnQ7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJyArIGxpbmVzW2ldWzBdLnNsaWNlKHRyaW1JbmRlbnQpO1xuICAgICAgICAgICAgaWYgKHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdICE9PSAnXFxuJylcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aCArIHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG59XG5mdW5jdGlvbiBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHsgb2Zmc2V0LCBwcm9wcyB9LCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICBpZiAocHJvcHNbMF0udHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKSB7XG4gICAgICAgIG9uRXJyb3IocHJvcHNbMF0sICdJTVBPU1NJQkxFJywgJ0Jsb2NrIHNjYWxhciBoZWFkZXIgbm90IGZvdW5kJyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7IHNvdXJjZSB9ID0gcHJvcHNbMF07XG4gICAgY29uc3QgbW9kZSA9IHNvdXJjZVswXTtcbiAgICBsZXQgaW5kZW50ID0gMDtcbiAgICBsZXQgY2hvbXAgPSAnJztcbiAgICBsZXQgZXJyb3IgPSAtMTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKCFjaG9tcCAmJiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSlcbiAgICAgICAgICAgIGNob21wID0gY2g7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbiA9IE51bWJlcihjaCk7XG4gICAgICAgICAgICBpZiAoIWluZGVudCAmJiBuKVxuICAgICAgICAgICAgICAgIGluZGVudCA9IG47XG4gICAgICAgICAgICBlbHNlIGlmIChlcnJvciA9PT0gLTEpXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBvZmZzZXQgKyBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChlcnJvciAhPT0gLTEpXG4gICAgICAgIG9uRXJyb3IoZXJyb3IsICdVTkVYUEVDVEVEX1RPS0VOJywgYEJsb2NrIHNjYWxhciBoZWFkZXIgaW5jbHVkZXMgZXh0cmEgY2hhcmFjdGVyczogJHtzb3VyY2V9YCk7XG4gICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHByb3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gcHJvcHNbaV07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIWhhc1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycyc7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCB0b2tlbi5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBVbmV4cGVjdGVkIHRva2VuIGluIGJsb2NrIHNjYWxhciBoZWFkZXI6ICR7dG9rZW4udHlwZX1gO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgaWYgKHRzICYmIHR5cGVvZiB0cyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgbW9kZSwgaW5kZW50LCBjaG9tcCwgY29tbWVudCwgbGVuZ3RoIH07XG59XG4vKiogQHJldHVybnMgQXJyYXkgb2YgbGluZXMgc3BsaXQgdXAgYXMgYFtpbmRlbnQsIGNvbnRlbnRdYCAqL1xuZnVuY3Rpb24gc3BsaXRMaW5lcyhzb3VyY2UpIHtcbiAgICBjb25zdCBzcGxpdCA9IHNvdXJjZS5zcGxpdCgvXFxuKCAqKS8pO1xuICAgIGNvbnN0IGZpcnN0ID0gc3BsaXRbMF07XG4gICAgY29uc3QgbSA9IGZpcnN0Lm1hdGNoKC9eKCAqKS8pO1xuICAgIGNvbnN0IGxpbmUwID0gbT8uWzFdXG4gICAgICAgID8gW21bMV0sIGZpcnN0LnNsaWNlKG1bMV0ubGVuZ3RoKV1cbiAgICAgICAgOiBbJycsIGZpcnN0XTtcbiAgICBjb25zdCBsaW5lcyA9IFtsaW5lMF07XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzcGxpdC5sZW5ndGg7IGkgKz0gMilcbiAgICAgICAgbGluZXMucHVzaChbc3BsaXRbaV0sIHNwbGl0W2kgKyAxXV0pO1xuICAgIHJldHVybiBsaW5lcztcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUJsb2NrU2NhbGFyIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlRmxvd1NjYWxhcihzY2FsYXIsIHN0cmljdCwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCB0eXBlLCBzb3VyY2UsIGVuZCB9ID0gc2NhbGFyO1xuICAgIGxldCBfdHlwZTtcbiAgICBsZXQgdmFsdWU7XG4gICAgY29uc3QgX29uRXJyb3IgPSAocmVsLCBjb2RlLCBtc2cpID0+IG9uRXJyb3Iob2Zmc2V0ICsgcmVsLCBjb2RlLCBtc2cpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUExBSU47XG4gICAgICAgICAgICB2YWx1ZSA9IHBsYWluVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUVVPVEVfU0lOR0xFO1xuICAgICAgICAgICAgdmFsdWUgPSBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBvbkVycm9yKHNjYWxhciwgJ1VORVhQRUNURURfVE9LRU4nLCBgRXhwZWN0ZWQgYSBmbG93IHNjYWxhciB2YWx1ZSwgYnV0IGZvdW5kOiAke3R5cGV9YCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6ICcnLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbb2Zmc2V0LCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoLCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoXVxuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBzdHJpY3QsIG9uRXJyb3IpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0eXBlOiBfdHlwZSxcbiAgICAgICAgY29tbWVudDogcmUuY29tbWVudCxcbiAgICAgICAgcmFuZ2U6IFtvZmZzZXQsIHZhbHVlRW5kLCByZS5vZmZzZXRdXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHBsYWluVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGJhZENoYXIgPSAnJztcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdhIHRhYiBjaGFyYWN0ZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdmbG93IGluZGljYXRvciBjaGFyYWN0ZXIgLCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2RpcmVjdGl2ZSBpbmRpY2F0b3IgY2hhcmFjdGVyICUnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+Jzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGBibG9jayBzY2FsYXIgaW5kaWNhdG9yICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgY2FzZSAnYCc6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgcmVzZXJ2ZWQgY2hhcmFjdGVyICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmFkQ2hhcilcbiAgICAgICAgb25FcnJvcigwLCAnQkFEX1NDQUxBUl9TVEFSVCcsIGBQbGFpbiB2YWx1ZSBjYW5ub3Qgc3RhcnQgd2l0aCAke2JhZENoYXJ9YCk7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2UpO1xufVxuZnVuY3Rpb24gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09IFwiJ1wiIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIFwiTWlzc2luZyBjbG9zaW5nICdxdW90ZVwiKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZS5zbGljZSgxLCAtMSkpLnJlcGxhY2UoLycnL2csIFwiJ1wiKTtcbn1cbmZ1bmN0aW9uIGZvbGRMaW5lcyhzb3VyY2UpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmVnYXRpdmUgbG9va2JlaGluZCBoZXJlIGFuZCBpbiB0aGUgYHJlYCBSZWdFeHAgaXMgdG9cbiAgICAgKiBwcmV2ZW50IGNhdXNpbmcgYSBwb2x5bm9taWFsIHNlYXJjaCB0aW1lIGluIGNlcnRhaW4gY2FzZXMuXG4gICAgICpcbiAgICAgKiBUaGUgdHJ5LWNhdGNoIGlzIGZvciBTYWZhcmksIHdoaWNoIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHlldDpcbiAgICAgKiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG4gICAgICovXG4gICAgbGV0IGZpcnN0LCBsaW5lO1xuICAgIHRyeSB7XG4gICAgICAgIGZpcnN0ID0gbmV3IFJlZ0V4cCgnKC4qPykoPzwhWyBcXHRdKVsgXFx0XSpcXHI/XFxuJywgJ3N5Jyk7XG4gICAgICAgIGxpbmUgPSBuZXcgUmVnRXhwKCdbIFxcdF0qKC4qPykoPzooPzwhWyBcXHRdKVsgXFx0XSopP1xccj9cXG4nLCAnc3knKTtcbiAgICB9XG4gICAgY2F0Y2ggKF8pIHtcbiAgICAgICAgZmlyc3QgPSAvKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICAgICAgbGluZSA9IC9bIFxcdF0qKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gZmlyc3QuZXhlYyhzb3VyY2UpO1xuICAgIGlmICghbWF0Y2gpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgbGV0IHJlcyA9IG1hdGNoWzFdO1xuICAgIGxldCBzZXAgPSAnICc7XG4gICAgbGV0IHBvcyA9IGZpcnN0Lmxhc3RJbmRleDtcbiAgICBsaW5lLmxhc3RJbmRleCA9IHBvcztcbiAgICB3aGlsZSAoKG1hdGNoID0gbGluZS5leGVjKHNvdXJjZSkpKSB7XG4gICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzZXA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gc2VwICsgbWF0Y2hbMV07XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gbGluZS5sYXN0SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSAvWyBcXHRdKiguKikvc3k7XG4gICAgbGFzdC5sYXN0SW5kZXggPSBwb3M7XG4gICAgbWF0Y2ggPSBsYXN0LmV4ZWMoc291cmNlKTtcbiAgICByZXR1cm4gcmVzICsgc2VwICsgKG1hdGNoPy5bMV0gPz8gJycpO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZvbGQsIG9mZnNldCB9ID0gZm9sZE5ld2xpbmUoc291cmNlLCBpKTtcbiAgICAgICAgICAgIHJlcyArPSBmb2xkO1xuICAgICAgICAgICAgaSA9IG9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVsrK2ldO1xuICAgICAgICAgICAgY29uc3QgY2MgPSBlc2NhcGVDb2Rlc1tuZXh0XTtcbiAgICAgICAgICAgIGlmIChjYylcbiAgICAgICAgICAgICAgICByZXMgKz0gY2M7XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBuZXdsaW5lcywgYnV0IHN0aWxsIHRyaW0gdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBlc2NhcGVkIENSTEYgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICd4JyB8fCBuZXh0ID09PSAndScgfHwgbmV4dCA9PT0gJ1UnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0geyB4OiAyLCB1OiA0LCBVOiA4IH1bbmV4dF07XG4gICAgICAgICAgICAgICAgcmVzICs9IHBhcnNlQ2hhckNvZGUoc291cmNlLCBpICsgMSwgbGVuZ3RoLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpICs9IGxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IHNvdXJjZS5zdWJzdHIoaSAtIDEsIDIpO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoaSAtIDEsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICAgICAgICAgIHJlcyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIHRyaW0gdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAgICAgY29uc3Qgd3NTdGFydCA9IGk7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICB3aGlsZSAobmV4dCA9PT0gJyAnIHx8IG5leHQgPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gJ1xcbicgJiYgIShuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDJdID09PSAnXFxuJykpXG4gICAgICAgICAgICAgICAgcmVzICs9IGkgPiB3c1N0YXJ0ID8gc291cmNlLnNsaWNlKHdzU3RhcnQsIGkgKyAxKSA6IGNoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IGNoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSAnXCInIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGNsb3NpbmcgXCJxdW90ZScpO1xuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIEZvbGQgYSBzaW5nbGUgbmV3bGluZSBpbnRvIGEgc3BhY2UsIG11bHRpcGxlIG5ld2xpbmVzIHRvIE4gLSAxIG5ld2xpbmVzLlxuICogUHJlc3VtZXMgYHNvdXJjZVtvZmZzZXRdID09PSAnXFxuJ2BcbiAqL1xuZnVuY3Rpb24gZm9sZE5ld2xpbmUoc291cmNlLCBvZmZzZXQpIHtcbiAgICBsZXQgZm9sZCA9ICcnO1xuICAgIGxldCBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICdcXG4nIHx8IGNoID09PSAnXFxyJykge1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInICYmIHNvdXJjZVtvZmZzZXQgKyAyXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIGZvbGQgKz0gJ1xcbic7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB9XG4gICAgaWYgKCFmb2xkKVxuICAgICAgICBmb2xkID0gJyAnO1xuICAgIHJldHVybiB7IGZvbGQsIG9mZnNldCB9O1xufVxuY29uc3QgZXNjYXBlQ29kZXMgPSB7XG4gICAgJzAnOiAnXFwwJyxcbiAgICBhOiAnXFx4MDcnLFxuICAgIGI6ICdcXGInLFxuICAgIGU6ICdcXHgxYicsXG4gICAgZjogJ1xcZicsXG4gICAgbjogJ1xcbicsXG4gICAgcjogJ1xccicsXG4gICAgdDogJ1xcdCcsXG4gICAgdjogJ1xcdicsXG4gICAgTjogJ1xcdTAwODUnLFxuICAgIF86ICdcXHUwMGEwJyxcbiAgICBMOiAnXFx1MjAyOCcsXG4gICAgUDogJ1xcdTIwMjknLFxuICAgICcgJzogJyAnLFxuICAgICdcIic6ICdcIicsXG4gICAgJy8nOiAnLycsXG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgJ1xcdCc6ICdcXHQnXG59O1xuZnVuY3Rpb24gcGFyc2VDaGFyQ29kZShzb3VyY2UsIG9mZnNldCwgbGVuZ3RoLCBvbkVycm9yKSB7XG4gICAgY29uc3QgY2MgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCwgbGVuZ3RoKTtcbiAgICBjb25zdCBvayA9IGNjLmxlbmd0aCA9PT0gbGVuZ3RoICYmIC9eWzAtOWEtZkEtRl0rJC8udGVzdChjYyk7XG4gICAgY29uc3QgY29kZSA9IG9rID8gcGFyc2VJbnQoY2MsIDE2KSA6IE5hTjtcbiAgICBpZiAoaXNOYU4oY29kZSkpIHtcbiAgICAgICAgY29uc3QgcmF3ID0gc291cmNlLnN1YnN0cihvZmZzZXQgLSAyLCBsZW5ndGggKyAyKTtcbiAgICAgICAgb25FcnJvcihvZmZzZXQgLSAyLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgcmV0dXJuIHJhdztcbiAgICB9XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KGNvZGUpO1xufVxuXG5leHBvcnQgeyByZXNvbHZlRmxvd1NjYWxhciB9O1xuIiwiaW1wb3J0IHsgU0NBTEFSLCBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tTY2FsYXIgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH0gZnJvbSAnLi9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJztcblxuZnVuY3Rpb24gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQsIHJhbmdlIH0gPSB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja1NjYWxhcih0b2tlbiwgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKVxuICAgICAgICA6IHJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0YWdUb2tlblxuICAgICAgICA/IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpXG4gICAgICAgIDogbnVsbDtcbiAgICBjb25zdCB0YWcgPSB0YWdUb2tlbiAmJiB0YWdOYW1lXG4gICAgICAgID8gZmluZFNjYWxhclRhZ0J5TmFtZShjdHguc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ3NjYWxhcidcbiAgICAgICAgICAgID8gZmluZFNjYWxhclRhZ0J5VGVzdChjdHgsIHZhbHVlLCB0b2tlbiwgb25FcnJvcilcbiAgICAgICAgICAgIDogY3R4LnNjaGVtYVtTQ0FMQVJdO1xuICAgIGxldCBzY2FsYXI7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmUodmFsdWUsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpO1xuICAgICAgICBzY2FsYXIgPSBpc1NjYWxhcihyZXMpID8gcmVzIDogbmV3IFNjYWxhcihyZXMpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKTtcbiAgICAgICAgc2NhbGFyID0gbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgfVxuICAgIHNjYWxhci5yYW5nZSA9IHJhbmdlO1xuICAgIHNjYWxhci5zb3VyY2UgPSB2YWx1ZTtcbiAgICBpZiAodHlwZSlcbiAgICAgICAgc2NhbGFyLnR5cGUgPSB0eXBlO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBzY2FsYXIudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnLmZvcm1hdClcbiAgICAgICAgc2NhbGFyLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgaWYgKGNvbW1lbnQpXG4gICAgICAgIHNjYWxhci5jb21tZW50ID0gY29tbWVudDtcbiAgICByZXR1cm4gc2NhbGFyO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5TmFtZShzY2hlbWEsIHZhbHVlLCB0YWdOYW1lLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGlmICh0YWdOYW1lID09PSAnIScpXG4gICAgICAgIHJldHVybiBzY2hlbWFbU0NBTEFSXTsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgIGNvbnN0IG1hdGNoV2l0aFRlc3QgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBzY2hlbWEudGFncykge1xuICAgICAgICBpZiAoIXRhZy5jb2xsZWN0aW9uICYmIHRhZy50YWcgPT09IHRhZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICh0YWcuZGVmYXVsdCAmJiB0YWcudGVzdClcbiAgICAgICAgICAgICAgICBtYXRjaFdpdGhUZXN0LnB1c2godGFnKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdGFnIG9mIG1hdGNoV2l0aFRlc3QpXG4gICAgICAgIGlmICh0YWcudGVzdD8udGVzdCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgIGNvbnN0IGt0ID0gc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICBpZiAoa3QgJiYgIWt0LmNvbGxlY3Rpb24pIHtcbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGtub3duIHRhZyBpcyBhdmFpbGFibGUgZm9yIHN0cmluZ2lmeWluZyxcbiAgICAgICAgLy8gYnV0IGRvZXMgbm90IGdldCB1c2VkIGJ5IGRlZmF1bHQuXG4gICAgICAgIHNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UsIHRlc3Q6IHVuZGVmaW5lZCB9KSk7XG4gICAgICAgIHJldHVybiBrdDtcbiAgICB9XG4gICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRhZ05hbWUgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInKTtcbiAgICByZXR1cm4gc2NoZW1hW1NDQUxBUl07XG59XG5mdW5jdGlvbiBmaW5kU2NhbGFyVGFnQnlUZXN0KHsgZGlyZWN0aXZlcywgc2NoZW1hIH0sIHZhbHVlLCB0b2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZyA9IHNjaGVtYS50YWdzLmZpbmQodGFnID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0Py50ZXN0KHZhbHVlKSkgfHwgc2NoZW1hW1NDQUxBUl07XG4gICAgaWYgKHNjaGVtYS5jb21wYXQpIHtcbiAgICAgICAgY29uc3QgY29tcGF0ID0gc2NoZW1hLmNvbXBhdC5maW5kKHRhZyA9PiB0YWcuZGVmYXVsdCAmJiB0YWcudGVzdD8udGVzdCh2YWx1ZSkpID8/XG4gICAgICAgICAgICBzY2hlbWFbU0NBTEFSXTtcbiAgICAgICAgaWYgKHRhZy50YWcgIT09IGNvbXBhdC50YWcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnLnRhZyk7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKGNvbXBhdC50YWcpO1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFZhbHVlIG1heSBiZSBwYXJzZWQgYXMgZWl0aGVyICR7dHN9IG9yICR7Y3N9YDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWc7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VTY2FsYXIgfTtcbiIsImZ1bmN0aW9uIGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcykge1xuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgaWYgKHBvcyA9PT0gbnVsbClcbiAgICAgICAgICAgIHBvcyA9IGJlZm9yZS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSBwb3MgLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgbGV0IHN0ID0gYmVmb3JlW2ldO1xuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUZWNobmljYWxseSwgYW4gZW1wdHkgc2NhbGFyIGlzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBsYXN0IG5vbi1lbXB0eVxuICAgICAgICAgICAgLy8gbm9kZSwgYnV0IGl0J3MgbW9yZSB1c2VmdWwgdG8gcGxhY2UgaXQgYWZ0ZXIgYW55IHdoaXRlc3BhY2UuXG4gICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgd2hpbGUgKHN0Py50eXBlID09PSAnc3BhY2UnKSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG59XG5cbmV4cG9ydCB7IGVtcHR5U2NhbGFyUG9zaXRpb24gfTtcbiIsImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgY29tcG9zZUNvbGxlY3Rpb24gfSBmcm9tICcuL2NvbXBvc2UtY29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBjb21wb3NlU2NhbGFyIH0gZnJvbSAnLi9jb21wb3NlLXNjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyBlbXB0eVNjYWxhclBvc2l0aW9uIH0gZnJvbSAnLi91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyc7XG5cbmNvbnN0IENOID0geyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9O1xuZnVuY3Rpb24gY29tcG9zZU5vZGUoY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IHNwYWNlQmVmb3JlLCBjb21tZW50LCBhbmNob3IsIHRhZyB9ID0gcHJvcHM7XG4gICAgbGV0IG5vZGU7XG4gICAgbGV0IGlzU3JjVG9rZW4gPSB0cnVlO1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZUFsaWFzKGN0eCwgdG9rZW4sIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ0FMSUFTX1BST1BTJywgJ0FuIGFsaWFzIG5vZGUgbXVzdCBub3Qgc3BlY2lmeSBhbnkgcHJvcGVydGllcycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0b2tlbi50eXBlID09PSAnZXJyb3InXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5tZXNzYWdlXG4gICAgICAgICAgICAgICAgOiBgVW5zdXBwb3J0ZWQgdG9rZW4gKHR5cGU6ICR7dG9rZW4udHlwZX0pYDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHRva2VuLm9mZnNldCwgdW5kZWZpbmVkLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpc1NyY1Rva2VuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFuY2hvciAmJiBub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgJiYgdG9rZW4uc291cmNlID09PSAnJylcbiAgICAgICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVHlwZSBjaGVja2luZyBtaXNzZXMgbWVhbmluZyBvZiBpc1NyY1Rva2VuXG4gICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMgJiYgaXNTcmNUb2tlbilcbiAgICAgICAgbm9kZS5zcmNUb2tlbiA9IHRva2VuO1xuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgYmVmb3JlLCBwb3MsIHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnc2NhbGFyJyxcbiAgICAgICAgb2Zmc2V0OiBlbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpLFxuICAgICAgICBpbmRlbnQ6IC0xLFxuICAgICAgICBzb3VyY2U6ICcnXG4gICAgfTtcbiAgICBjb25zdCBub2RlID0gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgIGlmIChhbmNob3IpIHtcbiAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSAnJylcbiAgICAgICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgbm9kZS5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgbm9kZS5yYW5nZVsyXSA9IGVuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBjb21wb3NlQWxpYXMoeyBvcHRpb25zIH0sIHsgb2Zmc2V0LCBzb3VyY2UsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgQWxpYXMoc291cmNlLnN1YnN0cmluZygxKSk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZSA9PT0gJycpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0FMSUFTJywgJ0FsaWFzIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBpZiAoYWxpYXMuc291cmNlLmVuZHNXaXRoKCc6JykpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgc291cmNlLmxlbmd0aCAtIDEsICdCQURfQUxJQVMnLCAnQWxpYXMgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBvcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgYWxpYXMucmFuZ2UgPSBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XTtcbiAgICBpZiAocmUuY29tbWVudClcbiAgICAgICAgYWxpYXMuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgcmV0dXJuIGFsaWFzO1xufVxuXG5leHBvcnQgeyBjb21wb3NlRW1wdHlOb2RlLCBjb21wb3NlTm9kZSB9O1xuIiwiaW1wb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuLi9kb2MvRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSBmcm9tICcuL2NvbXBvc2Utbm9kZS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuXG5mdW5jdGlvbiBjb21wb3NlRG9jKG9wdGlvbnMsIGRpcmVjdGl2ZXMsIHsgb2Zmc2V0LCBzdGFydCwgdmFsdWUsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogZGlyZWN0aXZlcyB9LCBvcHRpb25zKTtcbiAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICBjb25zdCBjdHggPSB7XG4gICAgICAgIGF0Um9vdDogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aXZlczogZG9jLmRpcmVjdGl2ZXMsXG4gICAgICAgIG9wdGlvbnM6IGRvYy5vcHRpb25zLFxuICAgICAgICBzY2hlbWE6IGRvYy5zY2hlbWFcbiAgICB9O1xuICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgIGluZGljYXRvcjogJ2RvYy1zdGFydCcsXG4gICAgICAgIG5leHQ6IHZhbHVlID8/IGVuZD8uWzBdLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG9uRXJyb3IsXG4gICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHByb3BzLmZvdW5kKSB7XG4gICAgICAgIGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICAodmFsdWUudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdmFsdWUudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAhcHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnTUlTU0lOR19DSEFSJywgJ0Jsb2NrIGNvbGxlY3Rpb24gY2Fubm90IHN0YXJ0IG9uIHNhbWUgbGluZSB3aXRoIGRpcmVjdGl2ZXMtZW5kIG1hcmtlcicpO1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElmIENvbnRlbnRzIGlzIHNldCwgbGV0J3MgdHJ1c3QgdGhlIHVzZXJcbiAgICBkb2MuY29udGVudHMgPSB2YWx1ZVxuICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgY29uc3QgY29udGVudEVuZCA9IGRvYy5jb250ZW50cy5yYW5nZVsyXTtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCBjb250ZW50RW5kLCBmYWxzZSwgb25FcnJvcik7XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGRvYy5jb21tZW50ID0gcmUuY29tbWVudDtcbiAgICBkb2MucmFuZ2UgPSBbb2Zmc2V0LCBjb250ZW50RW5kLCByZS5vZmZzZXRdO1xuICAgIHJldHVybiBkb2M7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VEb2MgfTtcbiIsImltcG9ydCB7IERpcmVjdGl2ZXMgfSBmcm9tICcuLi9kb2MvZGlyZWN0aXZlcy5qcyc7XG5pbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4uL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBZQU1MV2FybmluZywgWUFNTFBhcnNlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgaXNDb2xsZWN0aW9uLCBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBjb21wb3NlRG9jIH0gZnJvbSAnLi9jb21wb3NlLWRvYy5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5cbmZ1bmN0aW9uIGdldEVycm9yUG9zKHNyYykge1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIFtzcmMsIHNyYyArIDFdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNyYykpXG4gICAgICAgIHJldHVybiBzcmMubGVuZ3RoID09PSAyID8gc3JjIDogW3NyY1swXSwgc3JjWzFdXTtcbiAgICBjb25zdCB7IG9mZnNldCwgc291cmNlIH0gPSBzcmM7XG4gICAgcmV0dXJuIFtvZmZzZXQsIG9mZnNldCArICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyA/IHNvdXJjZS5sZW5ndGggOiAxKV07XG59XG5mdW5jdGlvbiBwYXJzZVByZWx1ZGUocHJlbHVkZSkge1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGF0Q29tbWVudCA9IGZhbHNlO1xuICAgIGxldCBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbHVkZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBwcmVsdWRlW2ldO1xuICAgICAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgY29tbWVudCArPVxuICAgICAgICAgICAgICAgICAgICAoY29tbWVudCA9PT0gJycgPyAnJyA6IGFmdGVyRW1wdHlMaW5lID8gJ1xcblxcbicgOiAnXFxuJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnKTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICBpZiAocHJlbHVkZVtpICsgMV0/LlswXSAhPT0gJyMnKVxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHdyb25nIGFmdGVyIGRvYy1lbmQsIGJ1dCBpbiB0aGF0IGNhc2UgaXQgZG9lc24ndCBtYXR0ZXJcbiAgICAgICAgICAgICAgICBpZiAoIWF0Q29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH07XG59XG4vKipcbiAqIENvbXBvc2UgYSBzdHJlYW0gb2YgQ1NUIG5vZGVzIGludG8gYSBzdHJlYW0gb2YgWUFNTCBEb2N1bWVudHMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IENvbXBvc2VyLCBQYXJzZXIgfSBmcm9tICd5YW1sJ1xuICpcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBjb25zdCB0b2tlbnMgPSBuZXcgUGFyc2VyKCkucGFyc2Uoc3JjKVxuICogY29uc3QgZG9jcyA9IG5ldyBDb21wb3NlcigpLmNvbXBvc2UodG9rZW5zKVxuICogYGBgXG4gKi9cbmNsYXNzIENvbXBvc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSAoc291cmNlLCBjb2RlLCBtZXNzYWdlLCB3YXJuaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyhzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHdhcm5pbmcpXG4gICAgICAgICAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKG5ldyBZQU1MV2FybmluZyhwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbjogb3B0aW9ucy52ZXJzaW9uIHx8ICcxLjInIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBkZWNvcmF0ZShkb2MsIGFmdGVyRG9jKSB7XG4gICAgICAgIGNvbnN0IHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfSA9IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHsgZGM6IGRvYy5jb21tZW50LCBwcmVsdWRlLCBjb21tZW50IH0pXG4gICAgICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYyA9IGRvYy5jb250ZW50cztcbiAgICAgICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50ID0gZG9jLmNvbW1lbnQgPyBgJHtkb2MuY29tbWVudH1cXG4ke2NvbW1lbnR9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhZnRlckVtcHR5TGluZSB8fCBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCB8fCAhZGMpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0NvbGxlY3Rpb24oZGMpICYmICFkYy5mbG93ICYmIGRjLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgaXQgPSBkYy5pdGVtc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQYWlyKGl0KSlcbiAgICAgICAgICAgICAgICAgICAgaXQgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBpdC5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGl0LmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gZGMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBkYy5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2MuZXJyb3JzLCB0aGlzLmVycm9ycyk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2Mud2FybmluZ3MsIHRoaXMud2FybmluZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jLmVycm9ycyA9IHRoaXMuZXJyb3JzO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzID0gdGhpcy53YXJuaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0cmVhbSBzdGF0dXMgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBNb3N0bHkgdXNlZnVsIGF0IHRoZSBlbmQgb2YgaW5wdXQgZm9yIGFuIGVtcHR5IHN0cmVhbS5cbiAgICAgKi9cbiAgICBzdHJlYW1JbmZvKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tbWVudDogcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSkuY29tbWVudCxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGVycm9yczogdGhpcy5lcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5nczogdGhpcy53YXJuaW5nc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wb3NlIHRva2VucyBpbnRvIGRvY3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmNvbXBvc2UodG9rZW5zLCBmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VucylcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQodG9rZW4pO1xuICAgICAgICB5aWVsZCogdGhpcy5lbmQoZm9yY2VEb2MsIGVuZE9mZnNldCk7XG4gICAgfVxuICAgIC8qKiBBZHZhbmNlIHRoZSBjb21wb3NlciBieSBvbmUgQ1NUIHRva2VuLiAqL1xuICAgICpuZXh0KHRva2VuKSB7XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMuYWRkKHRva2VuLnNvdXJjZSwgKG9mZnNldCwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHBvc1swXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihwb3MsICdCQURfRElSRUNUSVZFJywgbWVzc2FnZSwgd2FybmluZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVsdWRlLnB1c2godG9rZW4uc291cmNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBjb21wb3NlRG9jKHRoaXMub3B0aW9ucywgdGhpcy5kaXJlY3RpdmVzLCB0b2tlbiwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgJiYgIWRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSB0b2tlbi5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt0b2tlbi5tZXNzYWdlfTogJHtKU09OLnN0cmluZ2lmeSh0b2tlbi5zb3VyY2UpfWBcbiAgICAgICAgICAgICAgICAgICAgOiB0b2tlbi5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBtc2cpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcyB8fCAhdGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdVbmV4cGVjdGVkIGRvYy1lbmQgd2l0aG91dCBwcmVjZWRpbmcgZG9jdW1lbnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5kaXJlY3RpdmVzLmRvY0VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZCh0b2tlbi5lbmQsIHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGgsIHRoaXMuZG9jLm9wdGlvbnMuc3RyaWN0LCB0aGlzLm9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYyA9IHRoaXMuZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmNvbW1lbnQgPSBkYyA/IGAke2RjfVxcbiR7ZW5kLmNvbW1lbnR9YCA6IGVuZC5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5yYW5nZVsyXSA9IGVuZC5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5zdXBwb3J0ZWQgdG9rZW4gJHt0b2tlbi50eXBlfWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byB5aWVsZCBhbnkgcmVtYWluaW5nIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqZW5kKGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRvYykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JjZURvYykge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzIH0sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZW5kT2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgIGRvYy5yYW5nZSA9IFswLCBlbmRPZmZzZXQsIGVuZE9mZnNldF07XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgeWllbGQgZG9jO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb21wb3NlciB9O1xuIiwiZXhwb3J0IHsgY3JlYXRlU2NhbGFyVG9rZW4sIHJlc29sdmVBc1NjYWxhciwgc2V0U2NhbGFyVmFsdWUgfSBmcm9tICcuL2NzdC1zY2FsYXIuanMnO1xuZXhwb3J0IHsgc3RyaW5naWZ5IH0gZnJvbSAnLi9jc3Qtc3RyaW5naWZ5LmpzJztcbmV4cG9ydCB7IHZpc2l0IH0gZnJvbSAnLi9jc3QtdmlzaXQuanMnO1xuXG4vKiogVGhlIGJ5dGUgb3JkZXIgbWFyayAqL1xuY29uc3QgQk9NID0gJ1xcdXtGRUZGfSc7XG4vKiogU3RhcnQgb2YgZG9jLW1vZGUgKi9cbmNvbnN0IERPQ1VNRU5UID0gJ1xceDAyJzsgLy8gQzA6IFN0YXJ0IG9mIFRleHRcbi8qKiBVbmV4cGVjdGVkIGVuZCBvZiBmbG93LW1vZGUgKi9cbmNvbnN0IEZMT1dfRU5EID0gJ1xceDE4JzsgLy8gQzA6IENhbmNlbFxuLyoqIE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbmNvbnN0IFNDQUxBUiA9ICdcXHgxZic7IC8vIEMwOiBVbml0IFNlcGFyYXRvclxuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBgdG9rZW5gIGlzIGEgZmxvdyBvciBibG9jayBjb2xsZWN0aW9uICovXG5jb25zdCBpc0NvbGxlY3Rpb24gPSAodG9rZW4pID0+ICEhdG9rZW4gJiYgJ2l0ZW1zJyBpbiB0b2tlbjtcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgc2NhbGFyOyBub3QgYW4gYWxpYXMgKi9cbmNvbnN0IGlzU2NhbGFyID0gKHRva2VuKSA9PiAhIXRva2VuICYmXG4gICAgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJyk7XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuLyoqIEdldCBhIHByaW50YWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxleGVyIHRva2VuICovXG5mdW5jdGlvbiBwcmV0dHlUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJzxCT00+JztcbiAgICAgICAgY2FzZSBET0NVTUVOVDpcbiAgICAgICAgICAgIHJldHVybiAnPERPQz4nO1xuICAgICAgICBjYXNlIEZMT1dfRU5EOlxuICAgICAgICAgICAgcmV0dXJuICc8RkxPV19FTkQ+JztcbiAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICByZXR1cm4gJzxTQ0FMQVI+JztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0b2tlbik7XG4gICAgfVxufVxuLyoqIElkZW50aWZ5IHRoZSB0eXBlIG9mIGEgbGV4ZXIgdG9rZW4uIE1heSByZXR1cm4gYG51bGxgIGZvciB1bmtub3duIHRva2Vucy4gKi9cbmZ1bmN0aW9uIHRva2VuVHlwZShzb3VyY2UpIHtcbiAgICBzd2l0Y2ggKHNvdXJjZSkge1xuICAgICAgICBjYXNlIEJPTTpcbiAgICAgICAgICAgIHJldHVybiAnYnl0ZS1vcmRlci1tYXJrJztcbiAgICAgICAgY2FzZSBET0NVTUVOVDpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLW1vZGUnO1xuICAgICAgICBjYXNlIEZMT1dfRU5EOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LWVycm9yLWVuZCc7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICdzY2FsYXInO1xuICAgICAgICBjYXNlICctLS0nOlxuICAgICAgICAgICAgcmV0dXJuICdkb2Mtc3RhcnQnO1xuICAgICAgICBjYXNlICcuLi4nOlxuICAgICAgICAgICAgcmV0dXJuICdkb2MtZW5kJztcbiAgICAgICAgY2FzZSAnJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyXFxuJzpcbiAgICAgICAgICAgIHJldHVybiAnbmV3bGluZSc7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgcmV0dXJuICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICBjYXNlICc/JzpcbiAgICAgICAgICAgIHJldHVybiAnZXhwbGljaXQta2V5LWluZCc7XG4gICAgICAgIGNhc2UgJzonOlxuICAgICAgICAgICAgcmV0dXJuICdtYXAtdmFsdWUtaW5kJztcbiAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctbWFwLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctbWFwLWVuZCc7XG4gICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LXNlcS1zdGFydCc7XG4gICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LXNlcS1lbmQnO1xuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgIHJldHVybiAnY29tbWEnO1xuICAgIH1cbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiAnc3BhY2UnO1xuICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgIHJldHVybiAnY29tbWVudCc7XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgcmV0dXJuICdkaXJlY3RpdmUtbGluZSc7XG4gICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgcmV0dXJuICdhbGlhcyc7XG4gICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgcmV0dXJuICdhbmNob3InO1xuICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgIHJldHVybiAndGFnJztcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiAnc2luZ2xlLXF1b3RlZC1zY2FsYXInO1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4gJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgcmV0dXJuICdibG9jay1zY2FsYXItaGVhZGVyJztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCB7IEJPTSwgRE9DVU1FTlQsIEZMT1dfRU5ELCBTQ0FMQVIsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIsIHByZXR0eVRva2VuLCB0b2tlblR5cGUgfTtcbiIsImltcG9ydCB7IEJPTSwgRE9DVU1FTlQsIEZMT1dfRU5ELCBTQ0FMQVIgfSBmcm9tICcuL2NzdC5qcyc7XG5cbi8qXG5TVEFSVCAtPiBzdHJlYW1cblxuc3RyZWFtXG4gIGRpcmVjdGl2ZSAtPiBsaW5lLWVuZCAtPiBzdHJlYW1cbiAgaW5kZW50ICsgbGluZS1lbmQgLT4gc3RyZWFtXG4gIFtlbHNlXSAtPiBsaW5lLXN0YXJ0XG5cbmxpbmUtZW5kXG4gIGNvbW1lbnQgLT4gbGluZS1lbmRcbiAgbmV3bGluZSAtPiAuXG4gIGlucHV0LWVuZCAtPiBFTkRcblxubGluZS1zdGFydFxuICBkb2Mtc3RhcnQgLT4gZG9jXG4gIGRvYy1lbmQgLT4gc3RyZWFtXG4gIFtlbHNlXSAtPiBpbmRlbnQgLT4gYmxvY2stc3RhcnRcblxuYmxvY2stc3RhcnRcbiAgc2VxLWl0ZW0tc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIG1hcC12YWx1ZS1zdGFydCAtPiBibG9jay1zdGFydFxuICBbZWxzZV0gLT4gZG9jXG5cbmRvY1xuICBsaW5lLWVuZCAtPiBsaW5lLXN0YXJ0XG4gIHNwYWNlcyAtPiBkb2NcbiAgYW5jaG9yIC0+IGRvY1xuICB0YWcgLT4gZG9jXG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBkb2NcbiAgZmxvdy1lbmQgLT4gZXJyb3IgLT4gZG9jXG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZXJyb3IgLT4gZG9jXG4gIG1hcC12YWx1ZS1zdGFydCAtPiBkb2NcbiAgYWxpYXMgLT4gZG9jXG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZG9jXG4gIGJsb2NrLXNjYWxhci1oZWFkZXIgLT4gbGluZS1lbmQgLT4gYmxvY2stc2NhbGFyKG1pbikgLT4gbGluZS1zdGFydFxuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKGZhbHNlLCBtaW4pIC0+IGRvY1xuXG5mbG93XG4gIGxpbmUtZW5kIC0+IGZsb3dcbiAgc3BhY2VzIC0+IGZsb3dcbiAgYW5jaG9yIC0+IGZsb3dcbiAgdGFnIC0+IGZsb3dcbiAgZmxvdy1zdGFydCAtPiBmbG93IC0+IGZsb3dcbiAgZmxvdy1lbmQgLT4gLlxuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBmbG93XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBmbG93XG4gIG1hcC12YWx1ZS1zdGFydCAtPiBmbG93XG4gIGFsaWFzIC0+IGZsb3dcbiAgcXVvdGUtc3RhcnQgLT4gcXVvdGVkLXNjYWxhciAtPiBmbG93XG4gIGNvbW1hIC0+IGZsb3dcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcih0cnVlLCAwKSAtPiBmbG93XG5cbnF1b3RlZC1zY2FsYXJcbiAgcXVvdGUtZW5kIC0+IC5cbiAgW2Vsc2VdIC0+IHF1b3RlZC1zY2FsYXJcblxuYmxvY2stc2NhbGFyKG1pbilcbiAgbmV3bGluZSArIHBlZWsoaW5kZW50IDwgbWluKSAtPiAuXG4gIFtlbHNlXSAtPiBibG9jay1zY2FsYXIobWluKVxuXG5wbGFpbi1zY2FsYXIoaXMtZmxvdywgbWluKVxuICBzY2FsYXItZW5kKGlzLWZsb3cpIC0+IC5cbiAgcGVlayhuZXdsaW5lICsgKGluZGVudCA8IG1pbikpIC0+IC5cbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihtaW4pXG4qL1xuZnVuY3Rpb24gaXNFbXB0eShjaCkge1xuICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICBjYXNlICdcXHInOlxuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuY29uc3QgaGV4RGlnaXRzID0gJzAxMjM0NTY3ODlBQkNERUZhYmNkZWYnLnNwbGl0KCcnKTtcbmNvbnN0IHRhZ0NoYXJzID0gXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei0jOy8/OkAmPSskXy4hfionKClcIi5zcGxpdCgnJyk7XG5jb25zdCBpbnZhbGlkRmxvd1NjYWxhckNoYXJzID0gJyxbXXt9Jy5zcGxpdCgnJyk7XG5jb25zdCBpbnZhbGlkQW5jaG9yQ2hhcnMgPSAnICxbXXt9XFxuXFxyXFx0Jy5zcGxpdCgnJyk7XG5jb25zdCBpc05vdEFuY2hvckNoYXIgPSAoY2gpID0+ICFjaCB8fCBpbnZhbGlkQW5jaG9yQ2hhcnMuaW5jbHVkZXMoY2gpO1xuLyoqXG4gKiBTcGxpdHMgYW4gaW5wdXQgc3RyaW5nIGludG8gbGV4aWNhbCB0b2tlbnMsIGkuZS4gc21hbGxlciBzdHJpbmdzIHRoYXQgYXJlXG4gKiBlYXNpbHkgaWRlbnRpZmlhYmxlIGJ5IGB0b2tlbnMudG9rZW5UeXBlKClgLlxuICpcbiAqIExleGluZyBzdGFydHMgYWx3YXlzIGluIGEgXCJzdHJlYW1cIiBjb250ZXh0LiBJbmNvbXBsZXRlIGlucHV0IG1heSBiZSBidWZmZXJlZFxuICogdW50aWwgYSBjb21wbGV0ZSB0b2tlbiBjYW4gYmUgZW1pdHRlZC5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBzbGljZXMgb2YgdGhlIG9yaWdpbmFsIGlucHV0LCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgY2hhcmFjdGVyc1xuICogbWF5IGFsc28gYmUgZW1pdHRlZDpcbiAqXG4gKiAtIGBcXHgwMmAgKFN0YXJ0IG9mIFRleHQpOiBBIGRvY3VtZW50IHN0YXJ0cyB3aXRoIHRoZSBuZXh0IHRva2VuXG4gKiAtIGBcXHgxOGAgKENhbmNlbCk6IFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAoaW5kaWNhdGVzIGFuIGVycm9yKVxuICogLSBgXFx4MWZgIChVbml0IFNlcGFyYXRvcik6IE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWVcbiAqIC0gYFxcdXtGRUZGfWAgKEJ5dGUgb3JkZXIgbWFyayk6IEVtaXR0ZWQgc2VwYXJhdGVseSBvdXRzaWRlIGRvY3VtZW50c1xuICovXG5jbGFzcyBMZXhlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGJ1ZmZlciBtYXJrcyB0aGUgZW5kIG9mXG4gICAgICAgICAqIGFsbCBpbnB1dFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdEVuZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhwbGljaXQgaW5kZW50IHNldCBpbiBibG9jayBzY2FsYXIgaGVhZGVyLCBhcyBhbiBvZmZzZXQgZnJvbSB0aGUgY3VycmVudFxuICAgICAgICAgKiBtaW5pbXVtIGluZGVudCwgc28gZS5nLiBzZXQgdG8gMSBmcm9tIGEgaGVhZGVyIGB8MitgLiBTZXQgdG8gLTEgaWYgbm90XG4gICAgICAgICAqIGV4cGxpY2l0bHkgc2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICAvKipcbiAgICAgICAgICogQmxvY2sgc2NhbGFycyB0aGF0IGluY2x1ZGUgYSArIChrZWVwKSBjaG9tcGluZyBpbmRpY2F0b3IgaW4gdGhlaXIgaGVhZGVyXG4gICAgICAgICAqIGluY2x1ZGUgdHJhaWxpbmcgZW1wdHkgbGluZXMsIHdoaWNoIGFyZSBvdGhlcndpc2UgZXhjbHVkZWQgZnJvbSB0aGVcbiAgICAgICAgICogc2NhbGFyJ3MgY29udGVudHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbnB1dCAqL1xuICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBub3Rpbmcgd2hldGhlciB0aGUgbWFwIHZhbHVlIGluZGljYXRvciA6IGNhbiBpbW1lZGlhdGVseSBmb2xsb3cgdGhpc1xuICAgICAgICAgKiBub2RlIHdpdGhpbiBhIGZsb3cgY29udGV4dC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAvKiogQ291bnQgb2Ygc3Vycm91bmRpbmcgZmxvdyBjb2xsZWN0aW9uIGxldmVscy4gKi9cbiAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWluaW11bSBsZXZlbCBvZiBpbmRlbnRhdGlvbiByZXF1aXJlZCBmb3IgbmV4dCBsaW5lcyB0byBiZSBwYXJzZWQgYXMgYVxuICAgICAgICAgKiBwYXJ0IG9mIHRoZSBjdXJyZW50IHNjYWxhciB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgIC8qKiBJbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudCBsaW5lLiAqL1xuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgLyoqIFBvc2l0aW9uIG9mIHRoZSBuZXh0IFxcbiBjaGFyYWN0ZXIuICovXG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIC8qKiBTdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsZXhlciBpZiByZWFjaGluZyB0aGUgZW5kIG9mIGluY3BvbXBsZXRlIGlucHV0ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIC8qKiBBIHBvaW50ZXIgdG8gYGJ1ZmZlcmA7IHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsZXhlci4gKi9cbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBZQU1MIHRva2VucyBmcm9tIHRoZSBgc291cmNlYCBzdHJpbmcuIElmIGBpbmNvbXBsZXRlYCxcbiAgICAgKiBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIGxleGljYWwgdG9rZW5zXG4gICAgICovXG4gICAgKmxleChzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyID8gdGhpcy5idWZmZXIgKyBzb3VyY2UgOiBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRFbmQgPSAhaW5jb21wbGV0ZTtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLm5leHQgPz8gJ3N0cmVhbSc7XG4gICAgICAgIHdoaWxlIChuZXh0ICYmIChpbmNvbXBsZXRlIHx8IHRoaXMuaGFzQ2hhcnMoMSkpKVxuICAgICAgICAgICAgbmV4dCA9IHlpZWxkKiB0aGlzLnBhcnNlTmV4dChuZXh0KTtcbiAgICB9XG4gICAgYXRMaW5lRW5kKCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoIWNoIHx8IGNoID09PSAnIycgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbaSArIDFdID09PSAnXFxuJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjaGFyQXQobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5wb3MgKyBuXTtcbiAgICB9XG4gICAgY29udGludWVTY2FsYXIob2Zmc2V0KSB7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW29mZnNldF07XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpbmRlbnQgKyBvZmZzZXRdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpbmRlbnQgKyBvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicgfHwgKCFuZXh0ICYmICF0aGlzLmF0RW5kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGluZGVudCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ggPT09ICdcXG4nIHx8IGluZGVudCA+PSB0aGlzLmluZGVudE5leHQgfHwgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICA/IG9mZnNldCArIGluZGVudFxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgZHQgPSB0aGlzLmJ1ZmZlci5zdWJzdHIob2Zmc2V0LCAzKTtcbiAgICAgICAgICAgIGlmICgoZHQgPT09ICctLS0nIHx8IGR0ID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmJ1ZmZlcltvZmZzZXQgKyAzXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuICAgIGdldExpbmUoKSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmxpbmVFbmRQb3M7XG4gICAgICAgIGlmICh0eXBlb2YgZW5kICE9PSAnbnVtYmVyJyB8fCAoZW5kICE9PSAtMSAmJiBlbmQgPCB0aGlzLnBvcykpIHtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0RW5kID8gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKSA6IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcltlbmQgLSAxXSA9PT0gJ1xccicpXG4gICAgICAgICAgICBlbmQgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcywgZW5kKTtcbiAgICB9XG4gICAgaGFzQ2hhcnMobikge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgKyBuIDw9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG4gICAgc2V0TmV4dChzdGF0ZSkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gc3RhdGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgfVxuICAgICpwYXJzZU5leHQobmV4dCkge1xuICAgICAgICBzd2l0Y2ggKG5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlU3RyZWFtKCk7XG4gICAgICAgICAgICBjYXNlICdsaW5lLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdkb2MnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZURvY3VtZW50KCk7XG4gICAgICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VGbG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY2FzZSAncXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdwbGFpbi1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlU3RyZWFtKCkge1xuICAgICAgICBsZXQgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3N0cmVhbScpO1xuICAgICAgICBpZiAobGluZVswXSA9PT0gQk9NKSB7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVbMF0gPT09ICclJykge1xuICAgICAgICAgICAgbGV0IGRpckVuZCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgY3MgPSBsaW5lLmluZGV4T2YoJyMnKTtcbiAgICAgICAgICAgIGlmIChjcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaCA9IGxpbmVbY3MgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIGRpckVuZCA9IGNzIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2RpckVuZCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kIC09IDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KGRpckVuZCkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7IC8vIHBvc3NpYmxlIGNvbW1lbnRcbiAgICAgICAgICAgIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdExpbmVFbmQoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gc3ApO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBET0NVTUVOVDtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUxpbmVTdGFydCgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kICYmICF0aGlzLmhhc0NoYXJzKDQpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnBlZWsoMyk7XG4gICAgICAgICAgICBpZiAocyA9PT0gJy0tLScgJiYgaXNFbXB0eSh0aGlzLmNoYXJBdCgzKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSAnLi4uJyAmJiBpc0VtcHR5KHRoaXMuY2hhckF0KDMpKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3N0cmVhbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gdGhpcy5pbmRlbnRWYWx1ZSAmJiAhaXNFbXB0eSh0aGlzLmNoYXJBdCgxKSkpXG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IFtjaDAsIGNoMV0gPSB0aGlzLnBlZWsoMik7XG4gICAgICAgIGlmICghY2gxICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc3RhcnQnKTtcbiAgICAgICAgaWYgKChjaDAgPT09ICctJyB8fCBjaDAgPT09ICc/JyB8fCBjaDAgPT09ICc6JykgJiYgaXNFbXB0eShjaDEpKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZURvY3VtZW50KCkge1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZG9jJyk7XG4gICAgICAgIGxldCBuID0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFySGVhZGVyKCk7XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXIoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VGbG93Q29sbGVjdGlvbigpIHtcbiAgICAgICAgbGV0IG5sLCBzcDtcbiAgICAgICAgbGV0IGluZGVudCA9IC0xO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBubCA9IHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICBpZiAobmwgPiAwKSB7XG4gICAgICAgICAgICAgICAgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gaW5kZW50ID0gc3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcCArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICB9IHdoaWxlIChubCArIHNwID4gMCk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdmbG93Jyk7XG4gICAgICAgIGlmICgoaW5kZW50ICE9PSAtMSAmJiBpbmRlbnQgPCB0aGlzLmluZGVudE5leHQgJiYgbGluZVswXSAhPT0gJyMnKSB8fFxuICAgICAgICAgICAgKGluZGVudCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLi4uJykpICYmXG4gICAgICAgICAgICAgICAgaXNFbXB0eShsaW5lWzNdKSkpIHtcbiAgICAgICAgICAgIC8vIEFsbG93aW5nIGZvciB0aGUgdGVybWluYWwgXSBvciB9IGF0IHRoZSBzYW1lIChyYXRoZXIgdGhhbiBncmVhdGVyKVxuICAgICAgICAgICAgLy8gaW5kZW50IGxldmVsIGFzIHRoZSBpbml0aWFsIFsgb3IgeyBpcyB0ZWNobmljYWxseSBpbnZhbGlkLCBidXRcbiAgICAgICAgICAgIC8vIGZhaWxpbmcgaGVyZSB3b3VsZCBiZSBzdXJwcmlzaW5nIHRvIHVzZXJzLlxuICAgICAgICAgICAgY29uc3QgYXRGbG93RW5kTWFya2VyID0gaW5kZW50ID09PSB0aGlzLmluZGVudE5leHQgLSAxICYmXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPT09IDEgJiZcbiAgICAgICAgICAgICAgICAobGluZVswXSA9PT0gJ10nIHx8IGxpbmVbMF0gPT09ICd9Jyk7XG4gICAgICAgICAgICBpZiAoIWF0Rmxvd0VuZE1hcmtlcikge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDA7XG4gICAgICAgICAgICAgICAgeWllbGQgRkxPV19FTkQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICB3aGlsZSAobGluZVtuXSA9PT0gJywnKSB7XG4gICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93TGV2ZWwgPyAnZmxvdycgOiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mbG93S2V5IHx8IGlzRW1wdHkobmV4dCkgfHwgbmV4dCA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VRdW90ZWRTY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IHF1b3RlID0gdGhpcy5jaGFyQXQoMCk7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKHF1b3RlLCB0aGlzLnBvcyArIDEpO1xuICAgICAgICBpZiAocXVvdGUgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICB3aGlsZSAoZW5kICE9PSAtMSAmJiB0aGlzLmJ1ZmZlcltlbmQgKyAxXSA9PT0gXCInXCIpXG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZihcIidcIiwgZW5kICsgMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBkb3VibGUtcXVvdGVcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmJ1ZmZlcltlbmQgLSAxIC0gbl0gPT09ICdcXFxcJylcbiAgICAgICAgICAgICAgICAgICAgbiArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChuICUgMiA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZignXCInLCBlbmQgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGxvb2tpbmcgZm9yIG5ld2xpbmVzIHdpdGhpbiB0aGUgcXVvdGVzXG4gICAgICAgIGNvbnN0IHFiID0gdGhpcy5idWZmZXIuc3Vic3RyaW5nKDAsIGVuZCk7XG4gICAgICAgIGxldCBubCA9IHFiLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihubCArIDEpO1xuICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIG5sID0gcWIuaW5kZXhPZignXFxuJywgY3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3IgY2F1c2VkIGJ5IGFuIHVuZXhwZWN0ZWQgdW5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBubCAtIChxYltubCAtIDFdID09PSAnXFxyJyA/IDIgOiAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3F1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhckhlYWRlcigpIHtcbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnKycpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSB0cnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggPiAnMCcgJiYgY2ggPD0gJzknKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSBOdW1iZXIoY2gpIC0gMTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoICE9PSAnLScpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChjaCA9PiBpc0VtcHR5KGNoKSB8fCBjaCA9PT0gJyMnKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTY2FsYXIoKSB7XG4gICAgICAgIGxldCBubCA9IHRoaXMucG9zIC0gMTsgLy8gbWF5IGJlIC0xIGlmIHRoaXMucG9zID09PSAwXG4gICAgICAgIGxldCBpbmRlbnQgPSAwO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGxvb3A6IGZvciAobGV0IGkgPSB0aGlzLnBvczsgKGNoID0gdGhpcy5idWZmZXJbaV0pOyArK2kpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgICAgICAgICAgICAgIG5sID0gaTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICBpZiAoaW5kZW50ID49IHRoaXMuaW5kZW50TmV4dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IGluZGVudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgKz0gdGhpcy5ibG9ja1NjYWxhckluZGVudDtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKG5sICE9PSAtMSk7XG4gICAgICAgICAgICBpZiAobmwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuYmxvY2tTY2FsYXJLZWVwKSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IGkgPSBubCAtIDE7XG4gICAgICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJylcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclstLWldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyID0gaTsgLy8gRHJvcCB0aGUgbGluZSBpZiBsYXN0IGNoYXIgbm90IG1vcmUgaW5kZW50ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nICYmIGkgPj0gdGhpcy5wb3MgJiYgaSArIDEgKyBpbmRlbnQgPiBsYXN0Q2hhcilcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBTQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KG5sICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VQbGFpblNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICB3aGlsZSAoKGNoID0gdGhpcy5idWZmZXJbKytpXSkpIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuZXh0KSB8fCAoaW5GbG93ICYmIG5leHQgPT09ICcsJykpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0VtcHR5KGNoKSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJyMnIHx8IChpbkZsb3cgJiYgaW52YWxpZEZsb3dTY2FsYXJDaGFycy5pbmNsdWRlcyhuZXh0KSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBpID0gTWF0aC5tYXgoaSwgY3MgLSAyKTsgLy8gdG8gYWR2YW5jZSwgYnV0IHN0aWxsIGFjY291bnQgZm9yICcgIydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5GbG93ICYmIGludmFsaWRGbG93U2NhbGFyQ2hhcnMuaW5jbHVkZXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdwbGFpbi1zY2FsYXInKTtcbiAgICAgICAgeWllbGQgU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGluRmxvdyA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcHVzaENvdW50KG4pIHtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRvSW5kZXgoaSwgYWxsb3dFbXB0eSkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5idWZmZXIuc2xpY2UodGhpcy5wb3MsIGkpO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgeWllbGQgcztcbiAgICAgICAgICAgIHRoaXMucG9zICs9IHMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsbG93RW1wdHkpXG4gICAgICAgICAgICB5aWVsZCAnJztcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoSW5kaWNhdG9ycygpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmNoYXJBdCgwKSkge1xuICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaFRhZygpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgY2FzZSAnLSc6IC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgIGNhc2UgJz8nOiAvLyB0aGlzIGlzIGFuIGVycm9yIG91dHNpZGUgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgY2gxID0gdGhpcy5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkoY2gxKSB8fCAoaW5GbG93ICYmIGludmFsaWRGbG93U2NhbGFyQ2hhcnMuaW5jbHVkZXMoY2gxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbkZsb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5mbG93S2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRhZygpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhckF0KDEpID09PSAnPCcpIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAyO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoIWlzRW1wdHkoY2gpICYmIGNoICE9PSAnPicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGNoID09PSAnPicgPyBpICsgMSA6IGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAxO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFnQ2hhcnMuaW5jbHVkZXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2ggPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaW5jbHVkZXModGhpcy5idWZmZXJbaSArIDFdKSAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaW5jbHVkZXModGhpcy5idWZmZXJbaSArIDJdKSkge1xuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWyhpICs9IDMpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnB1c2hOZXdsaW5lKCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxyJyAmJiB0aGlzLmNoYXJBdCgxKSA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hTcGFjZXMoYWxsb3dUYWJzKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgfSB3aGlsZSAoY2ggPT09ICcgJyB8fCAoYWxsb3dUYWJzICYmIGNoID09PSAnXFx0JykpO1xuICAgICAgICBjb25zdCBuID0gaSAtIHRoaXMucG9zO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgICpwdXNoVW50aWwodGVzdCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKCF0ZXN0KGNoKSlcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IExleGVyIH07XG4iLCIvKipcbiAqIFRyYWNrcyBuZXdsaW5lcyBkdXJpbmcgcGFyc2luZyBpbiBvcmRlciB0byBwcm92aWRlIGFuIGVmZmljaWVudCBBUEkgZm9yXG4gKiBkZXRlcm1pbmluZyB0aGUgb25lLWluZGV4ZWQgYHsgbGluZSwgY29sIH1gIHBvc2l0aW9uIGZvciBhbnkgb2Zmc2V0XG4gKiB3aXRoaW4gdGhlIGlucHV0LlxuICovXG5jbGFzcyBMaW5lQ291bnRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubGluZVN0YXJ0cyA9IFtdO1xuICAgICAgICAvKipcbiAgICAgICAgICogU2hvdWxkIGJlIGNhbGxlZCBpbiBhc2NlbmRpbmcgb3JkZXIuIE90aGVyd2lzZSwgY2FsbFxuICAgICAgICAgKiBgbGluZUNvdW50ZXIubGluZVN0YXJ0cy5zb3J0KClgIGJlZm9yZSBjYWxsaW5nIGBsaW5lUG9zKClgLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGROZXdMaW5lID0gKG9mZnNldCkgPT4gdGhpcy5saW5lU3RhcnRzLnB1c2gob2Zmc2V0KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIGEgYmluYXJ5IHNlYXJjaCBhbmQgcmV0dXJucyB0aGUgMS1pbmRleGVkIHsgbGluZSwgY29sIH1cbiAgICAgICAgICogcG9zaXRpb24gb2YgYG9mZnNldGAuIElmIGBsaW5lID09PSAwYCwgYGFkZE5ld0xpbmVgIGhhcyBuZXZlciBiZWVuXG4gICAgICAgICAqIGNhbGxlZCBvciBgb2Zmc2V0YCBpcyBiZWZvcmUgdGhlIGZpcnN0IGtub3duIG5ld2xpbmUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxpbmVQb3MgPSAob2Zmc2V0KSA9PiB7XG4gICAgICAgICAgICBsZXQgbG93ID0gMDtcbiAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5saW5lU3RhcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7IC8vIE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW21pZF0gPCBvZmZzZXQpXG4gICAgICAgICAgICAgICAgICAgIGxvdyA9IG1pZCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBoaWdoID0gbWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1tsb3ddID09PSBvZmZzZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93ICsgMSwgY29sOiAxIH07XG4gICAgICAgICAgICBpZiAobG93ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IDAsIGNvbDogb2Zmc2V0IH07XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMubGluZVN0YXJ0c1tsb3cgLSAxXTtcbiAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdywgY29sOiBvZmZzZXQgLSBzdGFydCArIDEgfTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IExpbmVDb3VudGVyIH07XG4iLCJpbXBvcnQgeyB0b2tlblR5cGUgfSBmcm9tICcuL2NzdC5qcyc7XG5pbXBvcnQgeyBMZXhlciB9IGZyb20gJy4vbGV4ZXIuanMnO1xuXG5mdW5jdGlvbiBpbmNsdWRlc1Rva2VuKGxpc3QsIHR5cGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpXG4gICAgICAgIGlmIChsaXN0W2ldLnR5cGUgPT09IHR5cGUpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBmaW5kTm9uRW1wdHlJbmRleChsaXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHN3aXRjaCAobGlzdFtpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5mdW5jdGlvbiBpc0Zsb3dUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4/LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldFByZXZQcm9wcyhwYXJlbnQpIHtcbiAgICBzd2l0Y2ggKHBhcmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuc3RhcnQ7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ID0gcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiBpdC5zZXAgPz8gaXQuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnN0YXJ0O1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cbi8qKiBOb3RlOiBNYXkgbW9kaWZ5IGlucHV0IGFycmF5ICovXG5mdW5jdGlvbiBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldikge1xuICAgIGlmIChwcmV2Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGxldCBpID0gcHJldi5sZW5ndGg7XG4gICAgbG9vcDogd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgIHN3aXRjaCAocHJldltpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChwcmV2WysraV0/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgLyogbG9vcCAqL1xuICAgIH1cbiAgICByZXR1cm4gcHJldi5zcGxpY2UoaSwgcHJldi5sZW5ndGgpO1xufVxuZnVuY3Rpb24gZml4Rmxvd1NlcUl0ZW1zKGZjKSB7XG4gICAgaWYgKGZjLnN0YXJ0LnR5cGUgPT09ICdmbG93LXNlcS1zdGFydCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiBmYy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGl0LnNlcCAmJlxuICAgICAgICAgICAgICAgICFpdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0LmtleSlcbiAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0LmtleTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGbG93VG9rZW4oaXQudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZS5lbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpdC52YWx1ZS5lbmQsIGl0LnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlLmVuZCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpdC5zdGFydCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQuc2VwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFlBTUwgY29uY3JldGUgc3ludGF4IHRyZWUgKENTVCkgcGFyc2VyXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBmb3IgKGNvbnN0IHRva2VuIG9mIG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpKSB7XG4gKiAgIC8vIHRva2VuOiBUb2tlblxuICogfVxuICogYGBgXG4gKlxuICogVG8gdXNlIHRoZSBwYXJzZXIgd2l0aCBhIHVzZXItcHJvdmlkZWQgbGV4ZXI6XG4gKlxuICogYGBgdHNcbiAqIGZ1bmN0aW9uKiBwYXJzZShzb3VyY2U6IHN0cmluZywgbGV4ZXI6IExleGVyKSB7XG4gKiAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuICogICBmb3IgKGNvbnN0IGxleGVtZSBvZiBsZXhlci5sZXgoc291cmNlKSlcbiAqICAgICB5aWVsZCogcGFyc2VyLm5leHQobGV4ZW1lKVxuICogICB5aWVsZCogcGFyc2VyLmVuZCgpXG4gKiB9XG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IGxleGVyID0gbmV3IExleGVyKClcbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgcGFyc2Uoc3JjLCBsZXhlcikpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqL1xuY2xhc3MgUGFyc2VyIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25OZXdMaW5lIC0gSWYgZGVmaW5lZCwgY2FsbGVkIHNlcGFyYXRlbHkgd2l0aCB0aGUgc3RhcnQgcG9zaXRpb24gb2ZcbiAgICAgKiAgIGVhY2ggbmV3IGxpbmUgKGluIGBwYXJzZSgpYCwgaW5jbHVkaW5nIHRoZSBzdGFydCBvZiBpbnB1dCkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob25OZXdMaW5lKSB7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBzcGFjZSBhbmQgc2VxdWVuY2UgaW5kaWNhdG9ycyBjb3VudCBhcyBpbmRlbnRhdGlvbiAqL1xuICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBuZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG4gICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgKi9cbiAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAvKiogQ3VycmVudCBvZmZzZXQgc2luY2UgdGhlIHN0YXJ0IG9mIHBhcnNpbmcgKi9cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICAvKiogT24gdGhlIHNhbWUgbGluZSB3aXRoIGEgYmxvY2sgbWFwIGtleSAqL1xuICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAvKiogVG9wIGluZGljYXRlcyB0aGUgbm9kZSB0aGF0J3MgY3VycmVudGx5IGJlaW5nIGJ1aWx0ICovXG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgLyoqIFRoZSBzb3VyY2Ugb2YgdGhlIGN1cnJlbnQgdG9rZW4sIHNldCBpbiBwYXJzZSgpICovXG4gICAgICAgIHRoaXMuc291cmNlID0gJyc7XG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy50eXBlID0gJyc7XG4gICAgICAgIC8vIE11c3QgYmUgZGVmaW5lZCBhZnRlciBgbmV4dCgpYFxuICAgICAgICB0aGlzLmxleGVyID0gbmV3IExleGVyKCk7XG4gICAgICAgIHRoaXMub25OZXdMaW5lID0gb25OZXdMaW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBgc291cmNlYCBhcyBhIFlBTUwgc3RyZWFtLlxuICAgICAqIElmIGBpbmNvbXBsZXRlYCwgYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBFcnJvcnMgYXJlIG5vdCB0aHJvd24sIGJ1dCB5aWVsZGVkIGFzIGB7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2UgfWAgdG9rZW5zLlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBnZW5lcmF0b3Igb2YgdG9rZW5zIHJlcHJlc2VudGluZyBlYWNoIGRpcmVjdGl2ZSwgZG9jdW1lbnQsIGFuZCBvdGhlciBzdHJ1Y3R1cmUuXG4gICAgICovXG4gICAgKnBhcnNlKHNvdXJjZSwgaW5jb21wbGV0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSAmJiB0aGlzLm9mZnNldCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKDApO1xuICAgICAgICBmb3IgKGNvbnN0IGxleGVtZSBvZiB0aGlzLmxleGVyLmxleChzb3VyY2UsIGluY29tcGxldGUpKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubmV4dChsZXhlbWUpO1xuICAgICAgICBpZiAoIWluY29tcGxldGUpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5lbmQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWR2YW5jZSB0aGUgcGFyc2VyIGJ5IHRoZSBgc291cmNlYCBvZiBvbmUgbGV4aWNhbCB0b2tlbi5cbiAgICAgKi9cbiAgICAqbmV4dChzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIGlmICh0aGlzLmF0U2NhbGFyKSB7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gZmFsc2U7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0b2tlblR5cGUoc291cmNlKTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYE5vdCBhIFlBTUwgdG9rZW46ICR7c291cmNlfWA7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoeyB0eXBlOiAnZXJyb3InLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBtZXNzYWdlLCBzb3VyY2UgfSk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzY2FsYXInKSB7XG4gICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnc2NhbGFyJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgc291cmNlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lICYmIHNvdXJjZVswXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jLW1vZGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctZXJyb3ItZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byBwdXNoIG91dCBhbnkgcmVtYWluaW5nIGNvbnN0cnVjdGlvbnMgKi9cbiAgICAqZW5kKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGggPiAwKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIGdldCBzb3VyY2VUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN0O1xuICAgIH1cbiAgICAqc3RlcCgpIHtcbiAgICAgICAgY29uc3QgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZG9jLWVuZCcgJiYgKCF0b3AgfHwgdG9wLnR5cGUgIT09ICdkb2MtZW5kJykpIHtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdkb2MtZW5kJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdG9wKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnN0cmVhbSgpO1xuICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50KHRvcCk7XG4gICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5zY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrU2NhbGFyKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja01hcCh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTZXF1ZW5jZSh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZmxvd0NvbGxlY3Rpb24odG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5kb2N1bWVudEVuZCh0b3ApO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSBuXTtcbiAgICB9XG4gICAgKnBvcChlcnJvcikge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGVycm9yID8/IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1RyaWVkIHRvIHBvcCBhbiBlbXB0eSBzdGFjayc7XG4gICAgICAgICAgICB5aWVsZCB7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogJycsIG1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgeWllbGQgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgICAgICAgICAvLyBCbG9jayBzY2FsYXJzIHVzZSB0aGVpciBwYXJlbnQgcmF0aGVyIHRoYW4gaGVhZGVyIGluZGVudFxuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9ICdpbmRlbnQnIGluIHRvcCA/IHRvcC5pbmRlbnQgOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicgJiYgdG9wLnR5cGUgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgYWxsIGluZGVudCBmb3IgdG9wLWxldmVsIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgICAgICB0b2tlbi5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKVxuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyh0b2tlbik7XG4gICAgICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICB0b3AudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wLnByb3BzLnB1c2godG9rZW4pOyAvLyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9ICFpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIHZhbHVlOiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AodG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICAgICAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRva2VuLml0ZW1zW3Rva2VuLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vbkVtcHR5SW5kZXgobGFzdC5zdGFydCkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICh0b2tlbi5pbmRlbnQgPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSAhPT0gJ2NvbW1lbnQnIHx8IHN0LmluZGVudCA8IHRva2VuLmluZGVudCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5lbmQgPSBsYXN0LnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBsYXN0LnN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAqc3RyZWFtKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlLWxpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2RpcmVjdGl2ZScsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNvdXJjZVRva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkb2N1bWVudCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1zdGFydCcpXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChkb2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIHN0cmVhbWAsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgICpkb2N1bWVudChkb2MpIHtcbiAgICAgICAgaWYgKGRvYy52YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5saW5lRW5kKGRvYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmROb25FbXB0eUluZGV4KGRvYy5zdGFydCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGRvYyk7XG4gICAgICAgIGlmIChidilcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBkb2N1bWVudGAsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqc2NhbGFyKHNjYWxhcikge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHModGhpcy5wZWVrKDIpKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgbGV0IHNlcDtcbiAgICAgICAgICAgIGlmIChzY2FsYXIuZW5kKSB7XG4gICAgICAgICAgICAgICAgc2VwID0gc2NhbGFyLmVuZDtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2NhbGFyLmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBzY2FsYXIub2Zmc2V0LFxuICAgICAgICAgICAgICAgIGluZGVudDogc2NhbGFyLmluZGVudCxcbiAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogc2NhbGFyLCBzZXAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChzY2FsYXIpO1xuICAgIH1cbiAgICAqYmxvY2tTY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHNjYWxhci5wcm9wcy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgICAgICAgICAgICAgIC8vIGJsb2NrLXNjYWxhciBzb3VyY2UgaW5jbHVkZXMgdHJhaWxpbmcgbmV3bGluZVxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqYmxvY2tNYXAobWFwKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gaXQuc2VwIGlzIHRydWUtaXNoIGlmIHBhaXIgYWxyZWFkeSBoYXMga2V5IG9yIDogc2VwYXJhdG9yXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIG1hcC5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID49IG1hcC5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0TmV4dEl0ZW0gPSAhdGhpcy5vbktleUxpbmUgJiYgdGhpcy5pbmRlbnQgPT09IG1hcC5pbmRlbnQgJiYgaXQuc2VwO1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG5vZGVzLCBhc3NpZ24gbmV3bGluZS1zZXBhcmF0ZWQgbm90IGluZGVudGVkIGVtcHR5IHRva2VucyB0byBmb2xsb3dpbmcgbm9kZVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gW107XG4gICAgICAgICAgICBpZiAoYXROZXh0SXRlbSAmJiBpdC5zZXAgJiYgIWl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmwgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0LnNlcC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdCA9IGl0LnNlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LmluZGVudCA+IG1hcC5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+PSAyKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGl0LnNlcC5zcGxpY2UobmxbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwICYmICFpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ2V4cGxpY2l0LWtleS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzRmxvd1Rva2VuKGl0LmtleSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGUgZ3VhcmQgaXMgd3JvbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5rZXksIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5LCBzZXAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXJ0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgYWN0dWFsbHkgYXQgbmV4dCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwID0gaXQuc2VwLmNvbmNhdChzdGFydCwgdGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUgfHwgYXROZXh0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShtYXApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnYudHlwZSAhPT0gJ2Jsb2NrLXNlcScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmJsb2NrU2VxdWVuY2Uoc2VxKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdEluZGVudGVkQ29tbWVudChpdC5zdGFydCwgc2VxLmluZGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBzZXEuaXRlbXNbc2VxLml0ZW1zLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcHJldj8udmFsdWU/LmVuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVuZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlbmQsIGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSB8fCB0aGlzLmluZGVudCA8PSBzZXEuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZW50ICE9PSBzZXEuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ3NlcS1pdGVtLWluZCcpKVxuICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbmRlbnQgPiBzZXEuaW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKHNlcSk7XG4gICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgIH1cbiAgICAqZmxvd0NvbGxlY3Rpb24oZmMpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmYy5pdGVtc1tmYy5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2Zsb3ctZXJyb3ItZW5kJykge1xuICAgICAgICAgICAgbGV0IHRvcDtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgICAgICB9IHdoaWxlICh0b3AgJiYgdG9wLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmYy5lbmQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZnMpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtZW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LXNlcS1lbmQnOlxuICAgICAgICAgICAgICAgICAgICBmYy5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShmYyk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgaWYgKGJ2KVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBlZWsoMik7XG4gICAgICAgICAgICBpZiAocGFyZW50LnR5cGUgPT09ICdibG9jay1tYXAnICYmXG4gICAgICAgICAgICAgICAgKCh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJyAmJiBwYXJlbnQuaW5kZW50ID09PSBmYy5pbmRlbnQpIHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIXBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc2VwKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJyAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICBmaXhGbG93U2VxSXRlbXMoZmMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGZjLmVuZC5zcGxpY2UoMSwgZmMuZW5kLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBmYy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogZmMsIHNlcCB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXSA9IG1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLmxpbmVFbmQoZmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZsb3dTY2FsYXIodHlwZSkge1xuICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpIHtcbiAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgIHdoaWxlIChubCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgbmwpO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGFydEJsb2NrVmFsdWUocGFyZW50KSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhci1oZWFkZXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1zY2FsYXInLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogW3RoaXMuc291cmNlVG9rZW5dLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICcnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZmxvdy1jb2xsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuc291cmNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1zZXEnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzoge1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0IH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXRJbmRlbnRlZENvbW1lbnQoc3RhcnQsIGluZGVudCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnY29tbWVudCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA8PSBpbmRlbnQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBzdGFydC5ldmVyeShzdCA9PiBzdC50eXBlID09PSAnbmV3bGluZScgfHwgc3QudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgfVxuICAgICpkb2N1bWVudEVuZChkb2NFbmQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ2RvYy1tb2RlJykge1xuICAgICAgICAgICAgaWYgKGRvY0VuZC5lbmQpXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRvY0VuZC5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmxpbmVFbmQodG9rZW4pIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gYWxsIG90aGVyIHZhbHVlcyBhcmUgZXJyb3JzXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgUGFyc2VyIH07XG4iLCJpbXBvcnQgeyBDb21wb3NlciB9IGZyb20gJy4vY29tcG9zZS9jb21wb3Nlci5qcyc7XG5pbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4vZG9jL0RvY3VtZW50LmpzJztcbmltcG9ydCB7IHByZXR0aWZ5RXJyb3IsIFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJy4vbG9nLmpzJztcbmltcG9ydCB7IExpbmVDb3VudGVyIH0gZnJvbSAnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAnLi9wYXJzZS9wYXJzZXIuanMnO1xuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHByZXR0eUVycm9ycyA9IG9wdGlvbnMucHJldHR5RXJyb3JzICE9PSBmYWxzZTtcbiAgICBjb25zdCBsaW5lQ291bnRlciA9IG9wdGlvbnMubGluZUNvdW50ZXIgfHwgKHByZXR0eUVycm9ycyAmJiBuZXcgTGluZUNvdW50ZXIoKSkgfHwgbnVsbDtcbiAgICByZXR1cm4geyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH07XG59XG4vKipcbiAqIFBhcnNlIHRoZSBpbnB1dCBhcyBhIHN0cmVhbSBvZiBZQU1MIGRvY3VtZW50cy5cbiAqXG4gKiBEb2N1bWVudHMgc2hvdWxkIGJlIHNlcGFyYXRlZCBmcm9tIGVhY2ggb3RoZXIgYnkgYC4uLmAgb3IgYC0tLWAgbWFya2VyIGxpbmVzLlxuICpcbiAqIEByZXR1cm5zIElmIGFuIGVtcHR5IGBkb2NzYCBhcnJheSBpcyByZXR1cm5lZCwgaXQgd2lsbCBiZSBvZiB0eXBlXG4gKiAgIEVtcHR5U3RyZWFtIGFuZCBjb250YWluIGFkZGl0aW9uYWwgc3RyZWFtIGluZm9ybWF0aW9uLiBJblxuICogICBUeXBlU2NyaXB0LCB5b3Ugc2hvdWxkIHVzZSBgJ2VtcHR5JyBpbiBkb2NzYCBhcyBhIHR5cGUgZ3VhcmQgZm9yIGl0LlxuICovXG5mdW5jdGlvbiBwYXJzZUFsbERvY3VtZW50cyhzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvY3MgPSBBcnJheS5mcm9tKGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSkpKTtcbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKVxuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgfVxuICAgIGlmIChkb2NzLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFtdLCB7IGVtcHR5OiB0cnVlIH0sIGNvbXBvc2VyLnN0cmVhbUluZm8oKSk7XG59XG4vKiogUGFyc2UgYW4gaW5wdXQgc3RyaW5nIGludG8gYSBzaW5nbGUgWUFNTC5Eb2N1bWVudCAqL1xuZnVuY3Rpb24gcGFyc2VEb2N1bWVudChzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIC8vIGBkb2NgIGlzIGFsd2F5cyBzZXQgYnkgY29tcG9zZS5lbmQodHJ1ZSkgYXQgdGhlIHZlcnkgbGF0ZXN0XG4gICAgbGV0IGRvYyA9IG51bGw7XG4gICAgZm9yIChjb25zdCBfZG9jIG9mIGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSksIHRydWUsIHNvdXJjZS5sZW5ndGgpKSB7XG4gICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgZG9jID0gX2RvYztcbiAgICAgICAgZWxzZSBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKF9kb2MucmFuZ2Uuc2xpY2UoMCwgMiksICdNVUxUSVBMRV9ET0NTJywgJ1NvdXJjZSBjb250YWlucyBtdWx0aXBsZSBkb2N1bWVudHM7IHBsZWFzZSB1c2UgWUFNTC5wYXJzZUFsbERvY3VtZW50cygpJykpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcikge1xuICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jO1xufVxuZnVuY3Rpb24gcGFyc2Uoc3JjLCByZXZpdmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXZpdmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfcmV2aXZlciA9IHJldml2ZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXZpdmVyICYmIHR5cGVvZiByZXZpdmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0gcmV2aXZlcjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gcGFyc2VEb2N1bWVudChzcmMsIG9wdGlvbnMpO1xuICAgIGlmICghZG9jKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBkb2Mud2FybmluZ3MuZm9yRWFjaCh3YXJuaW5nID0+IHdhcm4oZG9jLm9wdGlvbnMubG9nTGV2ZWwsIHdhcm5pbmcpKTtcbiAgICBpZiAoZG9jLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpXG4gICAgICAgICAgICB0aHJvdyBkb2MuZXJyb3JzWzBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2MuZXJyb3JzID0gW107XG4gICAgfVxuICAgIHJldHVybiBkb2MudG9KUyhPYmplY3QuYXNzaWduKHsgcmV2aXZlcjogX3Jldml2ZXIgfSwgb3B0aW9ucykpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgucm91bmQob3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBpbmRlbnQgPCAxID8gdW5kZWZpbmVkIDogaW5kZW50ID4gOCA/IHsgaW5kZW50OiA4IH0gOiB7IGluZGVudCB9O1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQgfSA9IG9wdGlvbnMgPz8gcmVwbGFjZXIgPz8ge307XG4gICAgICAgIGlmICgha2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRG9jdW1lbnQodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucykudG9TdHJpbmcob3B0aW9ucyk7XG59XG5cbmV4cG9ydCB7IHBhcnNlLCBwYXJzZUFsbERvY3VtZW50cywgcGFyc2VEb2N1bWVudCwgc3RyaW5naWZ5IH07XG4iLCJpbXBvcnQgeyBfX2RlY29yYXRlIH0gZnJvbSAndHNsaWInO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJy4uLy4uL2NvbW1vbi9pbmRleC5qcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ3lhbWwnO1xuXG5sZXQgTmFpbHlDb25maWd1cmF0aW9uID0gY2xhc3MgTmFpbHlDb25maWd1cmF0aW9uIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgZ2V0Q29uZmlndXJlKF9idWlsZGVyLCBpc09wdGlvbmFsKSB7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhqb2luKHByb2Nlc3MuY3dkKCksIFwibmFpbHkueW1sXCIpKSAmJiAhaXNPcHRpb25hbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBuYWlseS55bWxgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlID0gcmVhZEZpbGVTeW5jKGpvaW4ocHJvY2Vzcy5jd2QoKSwgXCJuYWlseS55bWxcIikpLnRvU3RyaW5nKCk7XG4gICAgICAgIHJldHVybiBwYXJzZShmaWxlKTtcbiAgICB9XG59O1xuTmFpbHlDb25maWd1cmF0aW9uID0gX19kZWNvcmF0ZShbXG4gICAgSW5qZWN0YWJsZSgpXG5dLCBOYWlseUNvbmZpZ3VyYXRpb24pO1xuXG5leHBvcnQgeyBOYWlseUNvbmZpZ3VyYXRpb24gfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYm1GcGJIa3VZMjl1Wm1sbmRYSmhkR2x2Ymk1cWN5SXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2TGk0dmMzSmpMMkpoWTJ0bGJtUXZkbVZ1Wkc5eWN5OXVZV2xzZVM1amIyNW1hV2QxY21GMGFXOXVMblJ6SWwwc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYkltbHRjRzl5ZENCN0lHVjRhWE4wYzFONWJtTXNJSEpsWVdSR2FXeGxVM2x1WXlCOUlHWnliMjBnWENKbWMxd2lPMXh1YVcxd2IzSjBJSHNnU1c1cVpXTjBZV0pzWlNCOUlHWnliMjBnWENJdUxpOHVMaTlqYjIxdGIyNHZhVzVrWlhndWFuTmNJanRjYm1sdGNHOXlkQ0I3SUdwdmFXNGdmU0JtY205dElGd2ljR0YwYUZ3aU8xeHVhVzF3YjNKMElIc2djR0Z5YzJVZ2ZTQm1jbTl0SUZ3aWVXRnRiRndpTzF4dWFXMXdiM0owSUVwbGVHd2dabkp2YlNCY0ltcGxlR3hjSWp0Y2JseHVRRWx1YW1WamRHRmliR1VvS1Z4dVpYaHdiM0owSUdOc1lYTnpJRTVoYVd4NVEyOXVabWxuZFhKaGRHbHZiaUJwYlhCc1pXMWxiblJ6SUU1SlQwTXVRMjl1Wm1sbmRYSmxJSHRjYmlBZ0x5OGdaWE5zYVc1MExXUnBjMkZpYkdVdGJtVjRkQzFzYVc1bElFQjBlWEJsYzJOeWFYQjBMV1Z6YkdsdWRDOXVieTExYm5WelpXUXRkbUZ5YzF4dUlDQndkV0pzYVdNZ1oyVjBRMjl1Wm1sbmRYSmxLRjlpZFdsc1pHVnlPaUIwZVhCbGIyWWdTbVY0YkN3Z2FYTlBjSFJwYjI1aGJEb2dZbTl2YkdWaGJpa2dlMXh1SUNBZ0lHbG1JQ2doWlhocGMzUnpVM2x1WXlocWIybHVLSEJ5YjJObGMzTXVZM2RrS0Nrc0lGd2libUZwYkhrdWVXMXNYQ0lwS1NBbUppQWhhWE5QY0hScGIyNWhiQ2tnZTF4dUlDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLR0JEWVc1dWIzUWdabWx1WkNCdVlXbHNlUzU1Yld4Z0tUdGNiaUFnSUNCOVhHNGdJQ0FnWTI5dWMzUWdabWxzWlNBOUlISmxZV1JHYVd4bFUzbHVZeWhxYjJsdUtIQnliMk5sYzNNdVkzZGtLQ2tzSUZ3aWJtRnBiSGt1ZVcxc1hDSXBLUzUwYjFOMGNtbHVaeWdwTzF4dUlDQWdJSEpsZEhWeWJpQndZWEp6WlNobWFXeGxLVHRjYmlBZ2ZWeHVmVnh1SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3pzN096dEJRVTloTEVsQlFVRXNhMEpCUVd0Q0xFZEJRWGhDTEUxQlFVMHNhMEpCUVd0Q0xFTkJRVUU3TzBsQlJYUkNMRmxCUVZrc1EwRkJReXhSUVVGeFFpeEZRVUZGTEZWQlFXMUNMRVZCUVVFN1FVRkROVVFzVVVGQlFTeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNWMEZCVnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUlVGQlJUdEJRVU5vUlN4WlFVRkJMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlFTeHhRa0ZCUVN4RFFVRjFRaXhEUVVGRExFTkJRVU03VTBGRE1VTTdRVUZEUkN4UlFVRkJMRTFCUVUwc1NVRkJTU3hIUVVGSExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVGRkxGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNN1FVRkRka1VzVVVGQlFTeFBRVUZQTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRMUVVOd1FqdEZRVU5HTzBGQlZGa3NhMEpCUVd0Q0xFZEJRVUVzVlVGQlFTeERRVUZCTzBGQlJEbENMRWxCUVVFc1ZVRkJWU3hGUVVGRk8wRkJRMEVzUTBGQlFTeEZRVUZCTEd0Q1FVRnJRaXhEUVZNNVFqczdPenNpZlE9PVxuIiwiaW1wb3J0IHsgTmFpbHlEZWNvcmF0b3JGYWN0b3J5IH0gZnJvbSAnLi4vLi4vY29tbW9uL2NsYXNzZXMvZGVjb3JhdG9yLmZhY3RvcnkuanMnO1xuaW1wb3J0IHsgTmFpbHlCZWFuUmVnaXN0cnkgfSBmcm9tICcuLi8uLi9jb21tb24vY2xhc3Nlcy9pbmRleC5qcyc7XG5pbXBvcnQgeyBOYWlseUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi92ZW5kb3JzL2luZGV4LmpzJztcblxuZnVuY3Rpb24gVmFsdWUoamV4bCA9IFwiXCIsIGNvbmZpZ3VyZU9yT3B0aW9uYWwsIGNvbmZpZ3VyZSA9IG5ldyBOYWlseUNvbmZpZ3VyYXRpb24oKSkge1xuICAgIHJldHVybiBOYWlseURlY29yYXRvckZhY3RvcnkuY3JlYXRlUHJvcGVydHlEZWNvcmF0b3Ioe1xuICAgICAgICBhZnRlcih0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICB0YXJnZXRbcHJvcGVydHlLZXldID0gTmFpbHlCZWFuUmVnaXN0cnkuamV4bC5ldmFsU3luYyhqZXhsLCAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlndXJlT3JPcHRpb25hbCAmJiB0eXBlb2YgY29uZmlndXJlT3JPcHRpb25hbCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlndXJlT3JPcHRpb25hbC5nZXRDb25maWd1cmUoTmFpbHlCZWFuUmVnaXN0cnkuamV4bCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWd1cmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmUgPSBuZXcgTmFpbHlDb25maWd1cmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maWd1cmUuZ2V0Q29uZmlndXJlKE5haWx5QmVhblJlZ2lzdHJ5LmpleGwsIHR5cGVvZiBjb25maWd1cmVPck9wdGlvbmFsID09PSBcImJvb2xlYW5cIiA/IGNvbmZpZ3VyZU9yT3B0aW9uYWwgOiBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IFZhbHVlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRtRnNkV1V1WkdWamIzSmhkRzl5TG1weklpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTh1TGk5emNtTXZZbUZqYTJWdVpDOWtaV052Y21GMGIzSnpMM1poYkhWbExtUmxZMjl5WVhSdmNpNTBjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnZXlCT1lXbHNlVVJsWTI5eVlYUnZja1poWTNSdmNua2dmU0JtY205dElGd2lMaTR2TGk0dlkyOXRiVzl1TDJOc1lYTnpaWE12WkdWamIzSmhkRzl5TG1aaFkzUnZjbmt1YW5OY0lqdGNibWx0Y0c5eWRDQjdJRTVoYVd4NVFtVmhibEpsWjJsemRISjVJSDBnWm5KdmJTQmNJaTR1THk0dUwyTnZiVzF2Ymk5amJHRnpjMlZ6TDJsdVpHVjRMbXB6WENJN1hHNXBiWEJ2Y25RZ2V5Qk9ZV2xzZVVOdmJtWnBaM1Z5WVhScGIyNGdmU0JtY205dElGd2lMaTR2ZG1WdVpHOXljeTlwYm1SbGVDNXFjMXdpTzF4dVhHNWxlSEJ2Y25RZ1puVnVZM1JwYjI0Z1ZtRnNkV1VvYW1WNGJEb2djM1J5YVc1bklEMGdYQ0pjSWl3Z1kyOXVabWxuZFhKbFQzSlBjSFJwYjI1aGJEODZJR0p2YjJ4bFlXNGdmQ0JPU1U5RExrTnZibVpwWjNWeVpTd2dZMjl1Wm1sbmRYSmxPaUJPU1U5RExrTnZibVpwWjNWeVpTQTlJRzVsZHlCT1lXbHNlVU52Ym1acFozVnlZWFJwYjI0b0tTa2dlMXh1SUNCeVpYUjFjbTRnVG1GcGJIbEVaV052Y21GMGIzSkdZV04wYjNKNUxtTnlaV0YwWlZCeWIzQmxjblI1UkdWamIzSmhkRzl5S0h0Y2JpQWdJQ0JoWm5SbGNpaDBZWEpuWlhRc0lIQnliM0JsY25SNVMyVjVLU0I3WEc0Z0lDQWdJQ0IwWVhKblpYUmJjSEp2Y0dWeWRIbExaWGxkSUQwZ1RtRnBiSGxDWldGdVVtVm5hWE4wY25rdWFtVjRiQzVsZG1Gc1UzbHVZeWhjYmlBZ0lDQWdJQ0FnYW1WNGJDeGNiaUFnSUNBZ0lDQWdLQ2dwSUQwK0lIdGNiaUFnSUNBZ0lDQWdJQ0JwWmlBb0lXTnZibVpwWjNWeVpVOXlUM0IwYVc5dVlXd2dKaVlnZEhsd1pXOW1JR052Ym1acFozVnlaVTl5VDNCMGFXOXVZV3dnUFQwOUlGd2liMkpxWldOMFhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCamIyNW1hV2QxY21WUGNrOXdkR2x2Ym1Gc0xtZGxkRU52Ym1acFozVnlaU2hPWVdsc2VVSmxZVzVTWldkcGMzUnllUzVxWlhoc0lHRnpJR0Z1ZVN3Z1ptRnNjMlVwTzF4dUlDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0lXTnZibVpwWjNWeVpTa2dZMjl1Wm1sbmRYSmxJRDBnYm1WM0lFNWhhV3g1UTI5dVptbG5kWEpoZEdsdmJpZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOdmJtWnBaM1Z5WlM1blpYUkRiMjVtYVdkMWNtVW9UbUZwYkhsQ1pXRnVVbVZuYVhOMGNua3VhbVY0YkNCaGN5QmhibmtzSUhSNWNHVnZaaUJqYjI1bWFXZDFjbVZQY2s5d2RHbHZibUZzSUQwOVBTQmNJbUp2YjJ4bFlXNWNJaUEvSUdOdmJtWnBaM1Z5WlU5eVQzQjBhVzl1WVd3Z09pQm1ZV3h6WlNrN1hHNGdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5S1NncExGeHVJQ0FnSUNBZ0tUdGNiaUFnSUNCOUxGeHVJQ0I5S1R0Y2JuMWNiaUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3TzBGQlNVMHNVMEZCVlN4TFFVRkxMRU5CUVVNc1NVRkJaU3hIUVVGQkxFVkJRVVVzUlVGQlJTeHRRa0ZCT0VNc1JVRkJSU3hUUVVGQkxFZEJRVFJDTEVsQlFVa3NhMEpCUVd0Q0xFVkJRVVVzUlVGQlFUdEpRVU16U1N4UFFVRlBMSEZDUVVGeFFpeERRVUZETEhWQ1FVRjFRaXhEUVVGRE8xRkJRMjVFTEV0QlFVc3NRMEZCUXl4TlFVRk5MRVZCUVVVc1YwRkJWeXhGUVVGQk8wRkJRM1pDTEZsQlFVRXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhIUVVGSExHbENRVUZwUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRMjVFTEVsQlFVa3NSVUZEU2l4RFFVRkRMRTFCUVVzN1owSkJRMG9zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhKUVVGSkxFOUJRVThzYlVKQlFXMUNMRXRCUVVzc1VVRkJVU3hGUVVGRk8yOUNRVU51UlN4UFFVRlBMRzFDUVVGdFFpeERRVUZETEZsQlFWa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eEpRVUZYTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN2FVSkJReTlGTzNGQ1FVRk5PMEZCUTB3c2IwSkJRVUVzU1VGQlNTeERRVUZETEZOQlFWTTdRVUZCUlN4M1FrRkJRU3hUUVVGVExFZEJRVWNzU1VGQlNTeHJRa0ZCYTBJc1JVRkJSU3hEUVVGRE8yOUNRVU55UkN4UFFVRlBMRk5CUVZNc1EwRkJReXhaUVVGWkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1NVRkJWeXhGUVVGRkxFOUJRVThzYlVKQlFXMUNMRXRCUVVzc1UwRkJVeXhIUVVGSExHMUNRVUZ0UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRE8ybENRVU4wU1R0aFFVTkdMRWRCUVVjc1EwRkRUQ3hEUVVGRE8xTkJRMGc3UVVGRFJpeExRVUZCTEVOQlFVTXNRMEZCUXp0QlFVTk1PenM3T3lKOVxuIiwiaW1wb3J0IHsgQXV0b3dpcmVkLCBJbmplY3RhYmxlLCBOYWlseUJlYW5GYWN0b3J5LCBWYWx1ZSB9IGZyb20gXCJAbmFpbHlqcy9jb3JlL2JhY2tlbmRcIjtcbmltcG9ydCB7IFRlc3RTZXJ2aWNlIH0gZnJvbSBcIi4vdGVzdC5zZXJ2aWNlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0U2VydmljZTIge1xuICBAQXV0b3dpcmVkKClcbiAgcmVhZG9ubHkgdGVzdFNlcnZpY2U6IFQ7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUIHtcbiAgQEF1dG93aXJlZCgpXG4gIHByaXZhdGUgcmVhZG9ubHkgdGVzdFNlcnZpY2U6IFRlc3RTZXJ2aWNlO1xuXG4gIEBBdXRvd2lyZWQoKVxuICByZWFkb25seSB0ZXN0U2VydmljZTI6IFRlc3RTZXJ2aWNlMjtcblxuICBAVmFsdWUoXCJ0ZXN0XCIpXG4gIHJlYWRvbmx5IHRlc3Q6IHN0cmluZztcbn1cblxuY29uc29sZS5sb2cobmV3IE5haWx5QmVhbkZhY3RvcnkoVCkuY3JlYXRlSW5zdGFuY2UoKS50ZXN0U2VydmljZTIpO1xuIl0sIm5hbWVzIjpbIlNDQUxBUiIsImZsb2F0TmFOIiwiZmxvYXRFeHAiLCJmbG9hdCIsImludElkZW50aWZ5IiwiaW50UmVzb2x2ZSIsImludFN0cmluZ2lmeSIsImludE9jdCIsImludCIsImludEhleCIsInNjaGVtYSIsInNjaGVtYSQyIl0sIm1hcHBpbmdzIjoiOzs7O0FBRUEsTUFBTSxxQkFBcUIsQ0FBQztBQUM1QixJQUFJLE9BQU8sZUFBZSxDQUFDLEdBQUcsVUFBVSxFQUFFO0FBQzFDLFFBQVEsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxLQUFLO0FBQ3BELFlBQVksS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7QUFDaEQsZ0JBQWdCLElBQUksTUFBTSxZQUFZLFFBQVEsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUMvRCxvQkFBb0IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLG9CQUFvQixTQUFTO0FBQzdCLGlCQUFpQjtBQUNqQixnQkFBZ0IsU0FBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0QsYUFBYTtBQUNiLFNBQVMsQ0FBQztBQUNWLEtBQUs7QUFDTCxJQUFJLE9BQU8sb0JBQW9CLENBQUMsR0FBRyxVQUFVLEVBQUU7QUFDL0MsUUFBUSxPQUFPLENBQUMsTUFBTSxLQUFLO0FBQzNCLFlBQVksS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7QUFDaEQsZ0JBQWdCLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxhQUFhO0FBQ2IsU0FBUyxDQUFDO0FBQ1YsS0FBSztBQUNMLElBQUksT0FBTyxxQkFBcUIsQ0FBQyxHQUFHLFVBQVUsRUFBRTtBQUNoRCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsS0FBSztBQUNwRCxZQUFZLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO0FBQ2hELGdCQUFnQixTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLENB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LFFBQVEsTUFBTSxFQUFFLEVBQUU7QUFDbEIsUUFBUSxVQUFVLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJO0FBQ2xGLFFBQVEsTUFBTTtBQUNkLFFBQVEsT0FBTyxFQUFFLEdBQUc7QUFDcEIsS0FBSyxDQUFDO0FBQ04sQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDbEMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDbEIsUUFBUSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzRCxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQzVCLFlBQVksT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsS0FBSztBQUNMLElBQUksSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQzNCLElBQUksSUFBSSxHQUFHLENBQUM7QUFDWixJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3hCLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekIsUUFBUSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsUUFBUSxNQUFNO0FBQ2QsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENB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Q0FBQyxDQUFDO0FBQy9CLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFFBQVEsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRO0FBQ25DLFlBQVksT0FBTyxLQUFLLENBQUM7QUFDekIsUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUMsUUFBUSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLEtBQUs7QUFDTCxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO0FBQ3pCLFFBQVEsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRO0FBQ25DLFlBQVksT0FBTyxTQUFTLENBQUM7QUFDN0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLFFBQVEsT0FBTyxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDM0QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtBQUNiLFFBQVEsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLFFBQVEsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xFLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUks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LEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxJQUFJLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDckIsSUFBSSxJQUFJLE9BQU8sR0FBRyxHQUFHO0FBQ3JCLFNBQVMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsU0FBUyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDO0FBQ0EsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7QUFDekMsUUFBUSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqRSxRQUFRLE9BQU8sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRCxRQUFRLEVBQUUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLEtBQUs7QUFDTCxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFO0FBQzNCLFFBQVEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNqRDtBQUNBLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMzRDtBQUNBLFFBQVEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENB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bUJBQW1CLEtBQUssU0FBUyxHQUFHLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xKLGlCQUFpQjtBQUNqQixhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFNBQVM7QUFDVCxLQUFLLENBQUMsQ0FBQztBQUNQOztBQ2ZhLElBQUEsWUFBWSxHQUFsQixNQUFNLFlBQVksQ0FBQTtFQUd4QjtBQURVLFVBQUEsQ0FBQTtBQURSLElBQUEsU0FBUyxFQUFFOzhCQUNVLENBQUMsQ0FBQTtBQUFDLENBQUEsRUFBQSxZQUFBLENBQUEsU0FBQSxFQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBRmIsWUFBWSxHQUFBLFVBQUEsQ0FBQTtBQUR4QixJQUFBLFVBQVUsRUFBRTtBQUNBLENBQUEsRUFBQSxZQUFZLENBR3hCLENBQUE7QUFHWSxJQUFBLENBQUMsR0FBUCxNQUFNLENBQUMsQ0FBQTtFQVNiO0FBUGtCLFVBQUEsQ0FBQTtBQURoQixJQUFBLFNBQVMsRUFBRTs4QkFDa0IsV0FBVyxDQUFBO0FBQUMsQ0FBQSxFQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFHakMsVUFBQSxDQUFBO0FBRFIsSUFBQSxTQUFTLEVBQUU7OEJBQ1csWUFBWSxDQUFBO0FBQUMsQ0FBQSxFQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFHM0IsVUFBQSxDQUFBO0lBRFIsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFDUSxDQUFBLEVBQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQVJYLENBQUMsR0FBQSxVQUFBLENBQUE7QUFEYixJQUFBLFVBQVUsRUFBRTtBQUNBLENBQUEsRUFBQSxDQUFDLENBU2IsQ0FBQTtBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxZQUFZLENBQUM7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDUsNDYsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTYsNTcsNTgsNTksNjAsNjEsNjIsNjMsNjQsNjUsNjYsNjcsNjgsNjldfQ==
