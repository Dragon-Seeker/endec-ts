abstract class Endable /* extends AutoCloseable */ {

    public abstract end(): void;

    /* @Override
    default void close() {
        this.end();
    } */
}
