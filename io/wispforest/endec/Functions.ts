export type Consumer<T> = (t: T) => void;
export type Function<T, R> = (t: T) => R;
export type Supplier<R> = () => R;