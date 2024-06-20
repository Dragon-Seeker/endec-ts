import { Map as _map } from 'immutable';
import { Set as _set } from 'immutable';
import { SerializationAttribute } from './SerializationAttribute';

export class SerializationContext {

    private static readonly EMPTY: SerializationContext = new SerializationContext(new Map(), new Set());

    private readonly attributeValues: _map<SerializationAttribute, Object | null>;
    private readonly suppressedAttributes: _set<SerializationAttribute>;

    private constructor(attributeValues: Iterable<[SerializationAttribute, Object| null]>, suppressedAttributes: Iterable<SerializationAttribute>) {
        this.attributeValues = _map(attributeValues);
        this.suppressedAttributes = _set(suppressedAttributes);
    }

    public static empty() : SerializationContext {
        return SerializationContext.EMPTY;
    }

    public static attributes(...attributes: SerializationAttribute.Instance[]): SerializationContext {
        if (attributes.length == 0) return SerializationContext.EMPTY;
        return new SerializationContext(SerializationContext.unpackAttributes(attributes), new Set());
    }

    public static suppressed(...attributes: SerializationAttribute[]) : SerializationContext{
        if (attributes.length == 0) return SerializationContext.EMPTY;
        return new SerializationContext(new Map(), new Set(attributes));
    }

    public withAttributes(...attributes: SerializationAttribute.Instance[]): SerializationContext {
        var newAttributes = SerializationContext.unpackAttributes(attributes);

        this.attributeValues.forEach((value: Object | null, attribute: SerializationAttribute) => {
            if (!newAttributes.has(attribute)) newAttributes.set(attribute, value);
        });

        return new SerializationContext(newAttributes, this.suppressedAttributes);
    }

    public withoutAttributes(...attributes: SerializationAttribute[]): SerializationContext {
        var newAttributes = new Map(this.attributeValues);

        attributes.forEach((attribute) => newAttributes.delete(attribute))

        return new SerializationContext(newAttributes, this.suppressedAttributes);
    }

    public withSuppressed(...attributes: SerializationAttribute[]): SerializationContext {
        var newSuppressed = new Set(this.suppressedAttributes);

        attributes.forEach((attribute) => newSuppressed.add(attribute));

        return new SerializationContext(this.attributeValues, newSuppressed);
    }

    public withoutSuppressed(...attributes: SerializationAttribute[]): SerializationContext {
        var newSuppressed = new Set(this.suppressedAttributes);
        
        attributes.forEach((attribute) => newSuppressed.delete(attribute));

        return new SerializationContext(this.attributeValues, newSuppressed);
    }

    public and(other: SerializationContext): SerializationContext {
        var newAttributeValues = new Map(this.attributeValues);
        other.attributeValues.forEach((value, attribute) => newAttributeValues.set(attribute, value));

        var newSuppressed = new Set(this.suppressedAttributes);
        other.suppressedAttributes.forEach((value) => newSuppressed.add(value))

        return new SerializationContext(newAttributeValues, newSuppressed);
    }

    public hasAttribute(attribute: SerializationAttribute): boolean {
        return this.attributeValues.has(attribute) && !this.suppressedAttributes.contains(attribute);
    }

    // @SuppressWarnings("unchecked")
    public getAttributeValue<A extends Object>(attribute: SerializationAttribute.WithValue<A>): A {
        return this.attributeValues.get(attribute) as A;
    }

    public requireAttributeValue<A extends Object>(attribute: SerializationAttribute.WithValue<A>): A {
        if (!this.hasAttribute(attribute)) {
            throw new MissingAttributeValueException("Context did not provide a value for attribute '" + attribute.name + "'");
        }

        return this.getAttributeValue(attribute);
    }

    private static unpackAttributes(attributes: SerializationAttribute.Instance[]): Map<SerializationAttribute, Object | null> {
        var attributeValues = new Map<SerializationAttribute, Object | null>();

        attributes.forEach(instance => attributeValues.set(instance.attribute, instance.value));

        return attributeValues;
    }
}

class MissingAttributeValueException extends Error {}
