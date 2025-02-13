import { SerializationAttribute } from "./SerializationAttribute";

class SerializationAttributes {
    /**
     * This format is intended to be human-readable (and potentially -editable)
     * <p>
     * Endecs should use this to make decisions like representing a
     * {@link net.minecraft.util.math.BlockPos} as an integer sequence instead of packing it into a long
     */
    public static readonly HUMAN_READABLE: SerializationAttribute.Marker = SerializationAttribute.marker("human_readable");
}