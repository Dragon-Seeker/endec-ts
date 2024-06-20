import Collections = require('typescript-collections');
import { Serializer } from '../Serializer';
import { Endec } from '../Endec';
import { Consumer } from '../Functions';
import { SerializationContext } from '../SerializationContext';

export abstract class RecursiveSerializer<T extends Object> implements Serializer<T> {
    protected readonly frames: Collections.Stack<Frame<T>> = new Collections.Stack<Frame<T>>();
    protected resultValue: T;

    constructor(initialResult: T) {
        this.resultValue = initialResult;
        this.frames.push(new Frame<T>((t: T) => this.resultValue = t, false));
    }

    public setupContext(ctx: SerializationContext): SerializationContext {
        return ctx;
    }

    /**
     * Store {@code value} into the current encoding location
     * <p>
     * This location is altered by {@link #frame(FrameAction, boolean)} and
     * initially is just the serializer's result directly
     */
    protected consume(value: T) {
        this.frames.peek()!.sink(value);
    }

    /**
     * Whether this deserializer is currently decoding a field
     * of a struct - useful for, for instance, an optimized optional representation
     * by skipping the field to indicate an absent optional
     */
    protected isWritingStructField(): boolean {
        return this.frames.peek()!.isStructField;
    }

    /**
     * Encode the next value down the tree by pushing a new frame
     * onto the encoding stack and invoking {@code action}
     * <p>
     * {@code action} receives {@code encoded}, which is where the next call
     * to {@link #consume(Object)} (which {@code action} must somehow cause) will
     * store the value and allow {@code action} to retrieve it using {@link EncodedValue#get()}
     * or, preferably, {@link EncodedValue#require(String)}
     */
    protected frame(action: FrameAction<T>, isStructField: boolean) {
        var encoded = new EncodedValue<T>();

        this.frames.push(new Frame<T>(encoded.set, isStructField));
        action(encoded);
        this.frames.pop();
    }

    public result(): T {
        return this.resultValue;
    }

    //--

    public abstract writeByte(ctx: SerializationContext, value: Number): void;
    public abstract writeShort(ctx: SerializationContext, value: Number): void;
    public abstract writeInt(ctx: SerializationContext, value: Number): void;
    public abstract writeLong(ctx: SerializationContext, value: Number): void;
    public abstract writeFloat(ctx: SerializationContext, value: Number): void;
    public abstract writeDouble(ctx: SerializationContext, value: Number): void;

    public abstract writeVarInt(ctx: SerializationContext, value: Number): void;
    public abstract writeVarLong(ctx: SerializationContext, value: Number): void;

    public abstract writeBoolean(ctx: SerializationContext, value: Boolean): void;
    public abstract writeString(ctx: SerializationContext, value: String): void;
    public abstract writeBytes(ctx: SerializationContext, bytes: Number[]): void;

    public abstract writeOptional<V>(ctx: SerializationContext, endec: Endec<V>, optional?: V): void;

    public abstract sequence<E> (ctx: SerializationContext, elementEndec: Endec<E>, size: Number): Serializer.Sequence<E>;
    public abstract map<V> (ctx: SerializationContext, valueEndec: Endec<V>, siz: Number): Serializer.Map<V>;
    public abstract struct(): Serializer.Struct;
}

type FrameAction<T extends Object> = (encoded: EncodedValue<T>) => void;

class Frame<T extends Object> {
    public readonly sink: Consumer<T>;
    public readonly isStructField: boolean;

    constructor(sink: Consumer<T>, isStructField: boolean) {
        this.sink = sink
        this.isStructField = isStructField;
    }
}

class EncodedValue<T extends Object> {
    private value: T | null = null;
    private encoded: boolean = false;

    public set(value: T) {
        this.value = value;
        this.encoded = true;
    }

    public get(): T {
        return this.value!;
    }

    public wasEncoded(): boolean{
        return this.encoded;
    }

    public require(name: String): T {
        if (!this.encoded) throw new Error("Endec for " + name + " serialized nothing");
        return this.value!;
    }
}