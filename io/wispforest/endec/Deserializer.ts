import { Endec } from "./Endec";

import { Function } from './Functions';
import { SerializationContext } from "./SerializationContext";

export interface Deserializer<T> {
    setupContext(ctx: SerializationContext): SerializationContext;

    readByte(ctx: SerializationContext): Number;
    readShort(ctx: SerializationContext): Number;
    readInt(ctx: SerializationContext): Number;
    readLong(ctx: SerializationContext): Number;
    readFloat(ctx: SerializationContext): Number;
    readDouble(ctx: SerializationContext): Number;

    readVarInt(ctx: SerializationContext): Number;
    readVarLong(ctx: SerializationContext): Number;

    readBoolean(ctx: SerializationContext): boolean;
    readString(ctx: SerializationContext): String;
    readBytes(ctx: SerializationContext): Number[];
    readOptional<V>(ctx: SerializationContext, endec: Endec<V>): V | null;

    sequence<E> (ctx: SerializationContext, elementEndec: Endec<E>): Deserializer.Sequence<E>;
    map<V>(ctx: SerializationContext, valueEndec: Endec<V>):  Deserializer.Map<V> ;
    struct(): Deserializer.Struct;

    tryRead<V>(reader: Function<Deserializer<T>, V>): V;
}

export namespace Deserializer {
    export abstract class Sequence<E> implements Iterator<E> {
        public abstract estimatedSize(): Number;

        public abstract hasNext(): boolean;

        public abstract next(...args: [] | [undefined]): IteratorResult<E, undefined>;
    }

    export abstract class Map<E> implements Iterator<[String, E]> {
        public abstract estimatedSize(): Number;
    
        public abstract hasNext(): boolean;

        public abstract next(...args: [] | [undefined]): IteratorResult<[String, E], undefined>;
    }

    export abstract class Struct {
        /**
         * Decode the value of field {@code name} using {@code endec}. If no
         * such field exists in the serialized data, an exception is thrown
         */
        public abstract field<F>(name: String, ctx: SerializationContext, endec: Endec<F>): F | null ;

        /**
         * Decode the value of field {@code name} using {@code endec}. If no
         * such field exists in the serialized data, {@code defaultValue} is returned
         */
        public abstract field<F>(name: String, ctx: SerializationContext, endec: Endec<F>, defaultValue: F | null): F | null ;
    }
}