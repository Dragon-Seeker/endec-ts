import Collections = require('typescript-collections');
import { Deserializer } from "../Deserializer";
import { Endec } from "../Endec";
import { Function, Supplier } from '../Functions';
import { SerializationContext } from '../SerializationContext';

export abstract class RecursiveDeserializer<T extends Object> implements Deserializer<T> {

    protected frames: Collections.Stack<Frame<T>> = new Collections.Stack<Frame<T>>();
    protected readonly serialized: T;

    constructor(serialized: T) {
        this.serialized = serialized;
        this.frames.push(new Frame<T>(() => this.serialized, false));
    }

    /**
     * Get the value currently to be decoded
     * <p>
     * This value is altered by {@link #frame(Supplier, Supplier, boolean)} and
     * initially returns the entire serialized input
     */
    protected getValue(): T {
        return this.frames.peek()!.source();
    }

    /**
     * Whether this deserializer is currently decoding a field
     * of a struct - useful for, for instance, an optimized optional representation
     * by skipping the field to indicate an absent optional
     */
    protected isReadingStructField(): boolean  {
        return this.frames.peek()!.isStructField;
    }

    /**
     * Decode the next value down the tree, given by {@code nextValue}, by pushing that frame
     * onto the decoding stack, invoking {@code action}, and popping the frame again. Consequently,
     * all decoding of {@code nextValue} must happen inside {@code action}
     * <p>
     * If {@code nextValue} is reading the field of a struct, {@code isStructField} must be set
     */
    protected frame<V>(nextValue: Supplier<T>, action: Supplier<V>, isStructField: boolean): V {
        try {
            this.frames.push(new Frame<T>(nextValue, isStructField));
            return action();
        } finally {
            this.frames.pop();
        }
    }

    public tryRead<V>(reader: Function<Deserializer<T>, V>): V {
        var framesBackup = structuredClone(this.frames)

        try {
            return reader(this);
        } catch (e: any) {
            this.frames = framesBackup;

            throw e;
        }
    }

    //--
    public abstract setupContext(ctx: SerializationContext): SerializationContext;

    public abstract readByte(ctx: SerializationContext): Number;
    public abstract readShort(ctx: SerializationContext): Number;
    public abstract readInt(ctx: SerializationContext): Number;
    public abstract readLong(ctx: SerializationContext): Number;
    public abstract readFloat(ctx: SerializationContext): Number;
    public abstract readDouble(ctx: SerializationContext): Number;

    public abstract readVarInt(ctx: SerializationContext): Number;
    public abstract readVarLong(ctx: SerializationContext): Number;

    public abstract readBoolean(ctx: SerializationContext): boolean;
    public abstract readString(ctx: SerializationContext): String;
    public abstract readBytes(ctx: SerializationContext): Number[];
    public abstract readOptional<V>(ctx: SerializationContext, endec: Endec<V>): V | null;

    public abstract sequence<E> (ctx: SerializationContext, elementEndec: Endec<E>): Deserializer.Sequence<E>;
    public abstract map<V>(ctx: SerializationContext, valueEndec: Endec<V>):  Deserializer.Map<V> ;
    public abstract struct(): Deserializer.Struct;
}

class Frame<T> {
    public readonly source: Supplier<T>;
    public readonly isStructField: boolean;

    constructor(source: Supplier<T>, isStructField: boolean) {
        this.source = source;
        this.isStructField = isStructField;
    }
}

