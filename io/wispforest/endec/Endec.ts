import { Deserializer } from "./Deserializer";
import { SerializationContext } from "./SerializationContext";
import { Serializer } from "./Serializer";

export interface Endec<T> {
    /**
     * Write all data required to reconstruct {@code value} into {@code serializer}
     */
    encode(ctx: SerializationContext, serializer: Serializer<any>, value: T): void;

    /**
     * Decode the data specified by {@link #encode(SerializationContext, Serializer, Object)} and reconstruct
     * the corresponding instance of {@code T}.
     * <p>
     * Endecs which intend to handle deserialization failure by decoding a different
     * structure on error, must wrap their initial reads in a call to {@link Deserializer#tryRead(Function)}
     * to ensure that deserializer state is restored for the subsequent attempt
     */
    decode(ctx: SerializationContext, deserializer: Deserializer<any>): T;
}

namespace Endec {
    export function of<T>(encoder: Encoder<T>, decoder: Decoder<T>): Endec<T> {
        return new EndecImpl(encoder, decoder);
    }

    export let VOID: Endec<void> = Endec.of((_ctx, _serializer, _unused: void) => {}, (ctx, deserializer) => null);

    export let BOOLEAN: Endec<Boolean> = Endec.of((ctx, serializer, value) => serializer.writeBoolean(ctx, value), (ctx, deserializer) => deserializer.readBoolean(ctx));
    export let BYTE: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeByte(ctx, value), (ctx, deserializer) => deserializer.readByte(ctx));
    export let SHORT: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeShort(ctx, value), (ctx, deserializer) => deserializer.readShort(ctx));
    export let INT: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeInt(ctx, value), (ctx, deserializer) => deserializer.readInt(ctx));
    export let VAR_INT: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeVarInt(ctx, value), (ctx, deserializer) => deserializer.readVarInt(ctx));
    export let LONG: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeLong(ctx, value), (ctx, deserializer) => deserializer.readLong(ctx));
    export let VAR_LONG: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeVarLong(ctx, value), (ctx, deserializer) => deserializer.readVarLong(ctx));
    export let FLOAT: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeFloat(ctx, value), (ctx, deserializer) => deserializer.readFloat(ctx));
    export let DOUBLE: Endec<Number> = Endec.of((ctx, serializer, value) => serializer.writeDouble(ctx, value), (ctx, deserializer) => deserializer.readDouble(ctx));
    export let STRING: Endec<String> = Endec.of((ctx, serializer, value) => serializer.writeString(ctx, value), (ctx, deserializer) => deserializer.readString(ctx));
    export let BYTES: Endec<Number[]> = Endec.of((ctx, serializer, value) => serializer.writeBytes(ctx, value), (ctx, deserializer) => deserializer.readBytes(ctx));

    export type Encoder<T> = (ctx: SerializationContext, serializer: Serializer<any>, value: T) => void;
    export type Decoder<T> = (ctx: SerializationContext, deserializer: Deserializer<any>) => T;

    export type DecoderWithError<T> = (ctx: SerializationContext, deserializer: Deserializer<any> , exception: any) => T;
}

class EndecImpl<T> implements Endec<T> {
    private readonly encoder: Endec.Encoder<T>;
    private readonly decoder: Endec.Decoder<T>;

    constructor(encoder: Endec.Encoder<T>, decoder: Endec.Decoder<T>) {
        this.encoder = encoder;
        this.decoder = decoder;
    }
    
    public encode(ctx: SerializationContext, serializer: Serializer<any>, value: T): void {
        this.encoder(ctx, serializer, value);
    }

    public decode(ctx: SerializationContext, deserializer: Deserializer<any>): T {
        return this.decoder(ctx, deserializer);
    }
};

