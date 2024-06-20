export interface SerializationAttribute {
    readonly name: String;   
}

export namespace SerializationAttribute {
    export interface Instance {
        readonly attribute: SerializationAttribute;
        readonly value: Object | null;
    }
    
    export function marker(name: String) : Marker {
        return new Marker(name);
    }

    export function withValue<T extends Object>(name: String) : WithValue<T> {
        return new WithValue<T>(name);
    }

    export class Marker implements SerializationAttribute, Instance {
        public readonly name: String;
        
        public readonly attribute: SerializationAttribute = this;
        public readonly value: Object | null = null;
    
        constructor(name: String) {
            this.name = name;
        }
    }
    
    export class WithValue<T extends Object> implements SerializationAttribute {
        public readonly name: String;
    
        constructor(name: String) {
            this.name = name;
        }
    
        public instance(value: T) : WithValueInstance<T> {
            return new WithValueInstance<T>(this, value);
        }
    }

    class WithValueInstance<T extends Object> implements Instance {
        public readonly attribute: SerializationAttribute;
        public readonly value: Object | null;
    
        constructor(attribute: SerializationAttribute, value: T) {
            this.attribute = attribute;
            this.value = value;
        }
    }
}