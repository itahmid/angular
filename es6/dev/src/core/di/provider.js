var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { normalizeBool, CONST, isType, isBlank, isFunction, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 */
export let Provider = class Provider {
    constructor(token, { useClass, useValue, useExisting, useFactory, useProperty, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.useProperty = useProperty;
        this.dependencies = deps;
        this._multi = multi;
    }
    // TODO: Provide a full working example after alpha38 is released.
    /**
     * Creates multiple providers matching the same token (a multi-provider).
     *
     * Multi-providers are used for creating pluggable service, where the system comes
     * with some default providers, and the user can register additional providers.
     * The combination of the default providers and the additional providers will be
     * used to drive the behavior of the system.
     *
     * ### Example
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true}),
     *   new Provider("Strings", { useValue: "String2", multi: true})
     * ]);
     *
     * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
     * ```
     *
     * Multi-providers and regular providers cannot be mixed. The following
     * will throw an exception:
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true }),
     *   new Provider("Strings", { useValue: "String2"})
     * ]);
     * ```
     */
    get multi() { return normalizeBool(this._multi); }
};
Provider = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Provider);
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
export let Binding = class Binding extends Provider {
    constructor(token, { toClass, toValue, toAlias, toFactory, deps, multi }) {
        super(token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    /**
     * @deprecated
     */
    get toClass() { return this.useClass; }
    /**
     * @deprecated
     */
    get toAlias() { return this.useExisting; }
    /**
     * @deprecated
     */
    get toFactory() { return this.useFactory; }
    /**
     * @deprecated
     */
    get toValue() { return this.useValue; }
};
Binding = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Binding);
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link OpaqueToken-class.html}.
 *
 * @deprecated
 */
export function bind(token) {
    return new ProviderBuilder(token);
}
/**
 * Helper class for the {@link bind} function.
 */
export class ProviderBuilder {
    constructor(token) {
        this.token = token;
    }
    /**
     * Binds a DI token to a class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toClass(type) {
        if (!isType(type)) {
            throw new BaseException(`Trying to create a class provider but "${stringify(type)}" is not a class!`);
        }
        return new Provider(this.token, { useClass: type });
    }
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide('message', {useValue: 'Hello'})
     * ]);
     *
     * expect(injector.get('message')).toEqual('Hello');
     * ```
     */
    toValue(value) { return new Provider(this.token, { useValue: value }); }
    /**
     * Binds a DI token to an existing token.
     *
     * Angular will return the same instance as if the provided token was used. (This is
     * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
     *
     * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toAlias(aliasToken) {
        if (isBlank(aliasToken)) {
            throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
        }
        return new Provider(this.token, { useExisting: aliasToken });
    }
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide(Number, {useFactory: () => { return 1+2; }}),
     *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    toFactory(factory, dependencies) {
        if (!isFunction(factory)) {
            throw new BaseException(`Trying to create a factory provider but "${stringify(factory)}" is not a function!`);
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    }
}
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export function provide(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVk4N1czNFR0LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLGFBQWEsRUFFYixLQUFLLEVBQ0wsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsU0FBUyxFQUNWLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO0FBRTVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUg7SUF5SUUsWUFBWSxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBUXhGO1FBQ0MsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELGtFQUFrRTtJQUNsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTRCRztJQUNILElBQUksS0FBSyxLQUFjLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBNUxEO0lBQUMsS0FBSyxFQUFFOztZQUFBO0FBOExSOzs7O0dBSUc7QUFFSCwy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N0UsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCx3QkFBd0IsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBT3ZGO0lBQ0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtRQUN6QixRQUFRLEVBQUUsUUFBUTtRQUNsQixRQUFRLEVBQUUsUUFBUTtRQUNsQixXQUFXLEVBQUUsV0FBVztRQUN4QixVQUFVLEVBQUUsVUFBVTtRQUN0QixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxLQUFLO0tBQ2IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIG5vcm1hbGl6ZUJvb2wsXG4gIFR5cGUsXG4gIENPTlNULFxuICBpc1R5cGUsXG4gIGlzQmxhbmssXG4gIGlzRnVuY3Rpb24sXG4gIHN0cmluZ2lmeVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG4vKipcbiAqIERlc2NyaWJlcyBob3cgdGhlIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIGluc3RhbnRpYXRlIGEgZ2l2ZW4gdG9rZW4uXG4gKlxuICogU2VlIHtAbGluayBwcm92aWRlfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR05BeWo2SzZQZllnMk5Cemd3WjU/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIFRva2VuIHVzZWQgd2hlbiByZXRyaWV2aW5nIHRoaXMgcHJvdmlkZXIuIFVzdWFsbHksIGl0IGlzIGEgdHlwZSB7QGxpbmsgVHlwZX0uXG4gICAqL1xuICB0b2tlbjtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBpbXBsZW1lbnRhdGlvbiBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JTVEc4NnFnbW94Q3lqOVNXUHdZP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlQ2xhc3M6IFR5cGU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1VGVnNNVlFJRGU3bDR3YVd6aUVTP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VWYWx1ZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICoge0BsaW5rIEluamVjdG9yfSByZXR1cm5zIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC5cbiAgICogVGhpcyBpcyBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCBpcyByZXR1cm5lZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1FzYXRzT0pKNlA4VDJmTWU5Z3I4P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VFeGlzdGluZztcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBkZXBlbmRlbmNpZXMuXG4gICAqL1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHRoZSBwcm9wZXJ0eSBvZiB0aGUgY29uZmlndXJhdGlvbiBjbGFzcyB0byB1c2UgYXMgdmFsdWUuXG4gICAqXG4gICAqIE9ubHkgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBASW5qZWN0b3IgY2xhc3MuXG4gICAqL1xuICB1c2VQcm9wZXJ0eTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBzZXQgb2YgZGVwZW5kZW5jaWVzXG4gICAqIChhcyBgdG9rZW5gcykgd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHVzZUZhY3RvcnlgLlxuICAgKi9cbiAgZGVwZW5kZW5jaWVzOiBPYmplY3RbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9tdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIHVzZVByb3BlcnR5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICAgIHVzZVByb3BlcnR5Pzogc3RyaW5nLFxuICAgIGRlcHM/OiBPYmplY3RbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMudXNlUHJvcGVydHkgPSB1c2VQcm9wZXJ0eTtcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcHM7XG4gICAgdGhpcy5fbXVsdGkgPSBtdWx0aTtcbiAgfVxuXG4gIC8vIFRPRE86IFByb3ZpZGUgYSBmdWxsIHdvcmtpbmcgZXhhbXBsZSBhZnRlciBhbHBoYTM4IGlzIHJlbGVhc2VkLlxuICAvKipcbiAgICogQ3JlYXRlcyBtdWx0aXBsZSBwcm92aWRlcnMgbWF0Y2hpbmcgdGhlIHNhbWUgdG9rZW4gKGEgbXVsdGktcHJvdmlkZXIpLlxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYXJlIHVzZWQgZm9yIGNyZWF0aW5nIHBsdWdnYWJsZSBzZXJ2aWNlLCB3aGVyZSB0aGUgc3lzdGVtIGNvbWVzXG4gICAqIHdpdGggc29tZSBkZWZhdWx0IHByb3ZpZGVycywgYW5kIHRoZSB1c2VyIGNhbiByZWdpc3RlciBhZGRpdGlvbmFsIHByb3ZpZGVycy5cbiAgICogVGhlIGNvbWJpbmF0aW9uIG9mIHRoZSBkZWZhdWx0IHByb3ZpZGVycyBhbmQgdGhlIGFkZGl0aW9uYWwgcHJvdmlkZXJzIHdpbGwgYmVcbiAgICogdXNlZCB0byBkcml2ZSB0aGUgYmVoYXZpb3Igb2YgdGhlIHN5c3RlbS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCIsIG11bHRpOiB0cnVlfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJTdHJpbmdzXCIpKS50b0VxdWFsKFtcIlN0cmluZzFcIiwgXCJTdHJpbmcyXCJdKTtcbiAgICogYGBgXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhbmQgcmVndWxhciBwcm92aWRlcnMgY2Fubm90IGJlIG1peGVkLiBUaGUgZm9sbG93aW5nXG4gICAqIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uOlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlIH0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCJ9KVxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQgbXVsdGkoKTogYm9vbGVhbiB7IHJldHVybiBub3JtYWxpemVCb29sKHRoaXMuX211bHRpKTsgfVxufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJ9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBCaW5kaW5nIGV4dGVuZHMgUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3RvQ2xhc3MsIHRvVmFsdWUsIHRvQWxpYXMsIHRvRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdG9DbGFzcz86IFR5cGUsXG4gICAgdG9WYWx1ZT86IGFueSxcbiAgICB0b0FsaWFzPzogYW55LFxuICAgIHRvRmFjdG9yeTogRnVuY3Rpb24sIGRlcHM/OiBPYmplY3RbXSwgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICBzdXBlcih0b2tlbiwge1xuICAgICAgdXNlQ2xhc3M6IHRvQ2xhc3MsXG4gICAgICB1c2VWYWx1ZTogdG9WYWx1ZSxcbiAgICAgIHVzZUV4aXN0aW5nOiB0b0FsaWFzLFxuICAgICAgdXNlRmFjdG9yeTogdG9GYWN0b3J5LFxuICAgICAgZGVwczogZGVwcyxcbiAgICAgIG11bHRpOiBtdWx0aVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9DbGFzcygpIHsgcmV0dXJuIHRoaXMudXNlQ2xhc3M7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0FsaWFzKCkgeyByZXR1cm4gdGhpcy51c2VFeGlzdGluZzsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvRmFjdG9yeSgpIHsgcmV0dXJuIHRoaXMudXNlRmFjdG9yeTsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvVmFsdWUoKSB7IHJldHVybiB0aGlzLnVzZVZhbHVlOyB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogVG8gY29uc3RydWN0IGEge0BsaW5rIFByb3ZpZGVyfSwgYmluZCBhIGB0b2tlbmAgdG8gZWl0aGVyIGEgY2xhc3MsIGEgdmFsdWUsIGEgZmFjdG9yeSBmdW5jdGlvbixcbiAqIG9yXG4gKiB0byBhbiBleGlzdGluZyBgdG9rZW5gLlxuICogU2VlIHtAbGluayBQcm92aWRlckJ1aWxkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogVGhlIGB0b2tlbmAgaXMgbW9zdCBjb21tb25seSBhIGNsYXNzIG9yIHtAbGluayBPcGFxdWVUb2tlbi1jbGFzcy5odG1sfS5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZCh0b2tlbik6IFByb3ZpZGVyQnVpbGRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXJCdWlsZGVyKHRva2VuKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHRoZSB7QGxpbmsgYmluZH0gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm92aWRlckJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW4pIHt9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1pwQkNTWXF2NmUydWQ1S1hMZHhRP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0NsYXNzKHR5cGU6IFR5cGUpOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc1R5cGUodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgY2xhc3MgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkodHlwZSl9XCIgaXMgbm90IGEgY2xhc3MhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUNsYXNzOiB0eXBlfSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRzAyNFBGSG1ETDBjSkZnZlpLOE8/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB0b1ZhbHVlKHZhbHVlOiBhbnkpOiBQcm92aWRlciB7IHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZVZhbHVlOiB2YWx1ZX0pOyB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIEFuZ3VsYXIgd2lsbCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLiAoVGhpcyBpc1xuICAgKiBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCB3aWxsIGJlIHJldHVybmVkLilcbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3VCYW9GMnBONWNmYzVBZlphcE53P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0FsaWFzKGFsaWFzVG9rZW46IC8qVHlwZSovIGFueSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhhbGlhc1Rva2VuKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbiBub3QgYWxpYXMgJHtzdHJpbmdpZnkodGhpcy50b2tlbil9IHRvIGEgYmxhbmsgdmFsdWUhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUV4aXN0aW5nOiBhbGlhc1Rva2VufSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L09lak5JZlRUM3piMWlCeGFJWU9iP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShOdW1iZXIsIHt1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBwcm92aWRlKFN0cmluZywge3VzZUZhY3Rvcnk6ICh2KSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHY7IH0sIGRlcHM6IFtOdW1iZXJdfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvRmFjdG9yeShmYWN0b3J5OiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzPzogYW55W10pOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGZhY3RvcnkgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkoZmFjdG9yeSl9XCIgaXMgbm90IGEgZnVuY3Rpb24hYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUZhY3Rvcnk6IGZhY3RvcnksIGRlcHM6IGRlcGVuZGVuY2llc30pO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiA8IS0tIFRPRE86IGltcHJvdmUgdGhlIGRvY3MgLS0+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gIHVzZUNsYXNzPzogVHlwZSxcbiAgdXNlVmFsdWU/OiBhbnksXG4gIHVzZUV4aXN0aW5nPzogYW55LFxuICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gIGRlcHM/OiBPYmplY3RbXSxcbiAgbXVsdGk/OiBib29sZWFuXG59KTogUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyKHRva2VuLCB7XG4gICAgdXNlQ2xhc3M6IHVzZUNsYXNzLFxuICAgIHVzZVZhbHVlOiB1c2VWYWx1ZSxcbiAgICB1c2VFeGlzdGluZzogdXNlRXhpc3RpbmcsXG4gICAgdXNlRmFjdG9yeTogdXNlRmFjdG9yeSxcbiAgICBkZXBzOiBkZXBzLFxuICAgIG11bHRpOiBtdWx0aVxuICB9KTtcbn1cbiJdfQ==