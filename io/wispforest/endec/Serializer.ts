import { Endec } from "./Endec";
import { SerializationContext } from "./SerializationContext";

export interface Serializer<T extends Object> {
    setupContext(ctx: SerializationContext) : SerializationContext;

    writeByte(ctx: SerializationContext, value: Number): void;
    writeShort(ctx: SerializationContext, value: Number): void;
    writeInt(ctx: SerializationContext, value: Number): void;
    writeLong(ctx: SerializationContext, value: Number): void;
    writeFloat(ctx: SerializationContext, value: Number): void;
    writeDouble(ctx: SerializationContext, value: Number): void;

    writeVarInt(ctx: SerializationContext, value: Number): void;
    writeVarLong(ctx: SerializationContext, value: Number): void;

    writeBoolean(ctx: SerializationContext, value: Boolean): void;
    writeString(ctx: SerializationContext, value: String): void;
    writeBytes(ctx: SerializationContext, bytes: Number[]): void;

    writeOptional<V>(ctx: SerializationContext, endec: Endec<V>, optional?: V): void;

    sequence<E> (ctx: SerializationContext, elementEndec: Endec<E>, size: Number): Serializer.Sequence<E>;
    map<V> (ctx: SerializationContext, valueEndec: Endec<V>, siz: Number): Serializer.Map<V>;
    struct(): Serializer.Struct;

    result(): T;
}

export namespace Serializer {
    export abstract class Sequence<E> extends Endable {
        public abstract element(element: E): void;
    }
    
    export abstract class Map<V> extends Endable {
        public abstract entry(key: String, value: V): void;
    }
    
    export abstract class Struct extends Endable {
        public abstract field<F>(name: String, ctx: SerializationContext, endec: Endec<F>, value: F): Struct;
    }   
}