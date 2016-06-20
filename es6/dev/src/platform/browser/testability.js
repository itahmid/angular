import { ListWrapper } from 'angular2/src/facade/collection';
import { global, isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
class PublicTestability {
    constructor(testability) {
        this._testability = testability;
    }
    isStable() { return this._testability.isStable(); }
    whenStable(callback) { this._testability.whenStable(callback); }
    findBindings(using, provider, exactMatch) {
        return this.findProviders(using, provider, exactMatch);
    }
    findProviders(using, provider, exactMatch) {
        return this._testability.findBindings(using, provider, exactMatch);
    }
}
export class BrowserGetTestability {
    addToWindow(registry) {
        global.getAngularTestability = (elem, findInAncestors = true) => {
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return new PublicTestability(testability);
        };
        global.getAllAngularTestabilities = () => {
            var testabilities = registry.getAllTestabilities();
            return testabilities.map((testability) => { return new PublicTestability(testability); });
        };
        global.getAllAngularRootElements = () => registry.getAllRootElements();
        var whenAllStable = (callback) => {
            var testabilities = global.getAllAngularTestabilities();
            var count = testabilities.length;
            var didWork = false;
            var decrement = function (didWork_) {
                didWork = didWork || didWork_;
                count--;
                if (count == 0) {
                    callback(didWork);
                }
            };
            testabilities.forEach(function (testability) { testability.whenStable(decrement); });
        };
        if (!global.frameworkStabilizers) {
            global.frameworkStabilizers = ListWrapper.createGrowableSize(0);
        }
        global.frameworkStabilizers.push(whenAllStable);
    }
    findTestabilityInTree(registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        var t = registry.getTestability(elem);
        if (isPresent(t)) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, DOM.getHost(elem), true);
        }
        return this.findTestabilityInTree(registry, DOM.parentElement(elem), true);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVk4N1czNFR0LnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFrQixXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBb0IsTUFBTSxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUl0RSxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztBQVN6RDtJQUlFLFlBQVksV0FBd0I7UUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUFDLENBQUM7SUFFMUUsUUFBUSxLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU1RCxVQUFVLENBQUMsUUFBa0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUUsWUFBWSxDQUFDLEtBQVUsRUFBRSxRQUFnQixFQUFFLFVBQW1CO1FBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELGFBQWEsQ0FBQyxLQUFVLEVBQUUsUUFBZ0IsRUFBRSxVQUFtQjtRQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRSxDQUFDO0FBQ0gsQ0FBQztBQUVEO0lBQ0UsV0FBVyxDQUFDLFFBQTZCO1FBQ3ZDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLElBQVMsRUFBRSxlQUFlLEdBQVksSUFBSTtZQUN4RSxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMscUJB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b250ZW50IjpbImltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q09OU1QsIENPTlNUX0VYUFIsIGdsb2JhbCwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7XG4gIEluamVjdGFibGUsXG4gIFRlc3RhYmlsaXR5UmVnaXN0cnksXG4gIFRlc3RhYmlsaXR5LFxuICBHZXRUZXN0YWJpbGl0eSxcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmNsYXNzIFB1YmxpY1Rlc3RhYmlsaXR5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5O1xuXG4gIGNvbnN0cnVjdG9yKHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkgeyB0aGlzLl90ZXN0YWJpbGl0eSA9IHRlc3RhYmlsaXR5OyB9XG5cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90ZXN0YWJpbGl0eS5pc1N0YWJsZSgpOyB9XG5cbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24pIHsgdGhpcy5fdGVzdGFiaWxpdHkud2hlblN0YWJsZShjYWxsYmFjayk7IH1cblxuICBmaW5kQmluZGluZ3ModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUHJvdmlkZXJzKHVzaW5nLCBwcm92aWRlciwgZXhhY3RNYXRjaCk7XG4gIH1cblxuICBmaW5kUHJvdmlkZXJzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyh1c2luZywgcHJvdmlkZXIsIGV4YWN0TWF0Y2gpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7XG4gICAgZ2xvYmFsLmdldEFuZ3VsYXJUZXN0YWJpbGl0eSA9IChlbGVtOiBhbnksIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbiA9IHRydWUpID0+IHtcbiAgICAgIHZhciB0ZXN0YWJpbGl0eSA9IHJlZ2lzdHJ5LmZpbmRUZXN0YWJpbGl0eUluVHJlZShlbGVtLCBmaW5kSW5BbmNlc3RvcnMpO1xuICAgICAgaWYgKHRlc3RhYmlsaXR5ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCB0ZXN0YWJpbGl0eSBmb3IgZWxlbWVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUHVibGljVGVzdGFiaWxpdHkodGVzdGFiaWxpdHkpO1xuICAgIH07XG5cbiAgICBnbG9iYWwuZ2V0QWxsQW5ndWxhclRlc3RhYmlsaXRpZXMgPSAoKSA9PiB7XG4gICAgICB2YXIgdGVzdGFiaWxpdGllcyA9IHJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMoKTtcbiAgICAgIHJldHVybiB0ZXN0YWJpbGl0aWVzLm1hcCgodGVzdGFiaWxpdHkpID0+IHsgcmV0dXJuIG5ldyBQdWJsaWNUZXN0YWJpbGl0eSh0ZXN0YWJpbGl0eSk7IH0pO1xuICAgIH07XG5cbiAgICBnbG9iYWwuZ2V0QWxsQW5ndWxhclJvb3RFbGVtZW50cyA9ICgpID0+IHJlZ2lzdHJ5LmdldEFsbFJvb3RFbGVtZW50cygpO1xuXG4gICAgdmFyIHdoZW5BbGxTdGFibGUgPSAoY2FsbGJhY2spID0+IHtcbiAgICAgIHZhciB0ZXN0YWJpbGl0aWVzID0gZ2xvYmFsLmdldEFsbEFuZ3VsYXJUZXN0YWJpbGl0aWVzKCk7XG4gICAgICB2YXIgY291bnQgPSB0ZXN0YWJpbGl0aWVzLmxlbmd0aDtcbiAgICAgIHZhciBkaWRXb3JrID0gZmFsc2U7XG4gICAgICB2YXIgZGVjcmVtZW50ID0gZnVuY3Rpb24oZGlkV29ya18pIHtcbiAgICAgICAgZGlkV29yayA9IGRpZFdvcmsgfHwgZGlkV29ya187XG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIGlmIChjb3VudCA9PSAwKSB7XG4gICAgICAgICAgY2FsbGJhY2soZGlkV29yayk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0ZXN0YWJpbGl0aWVzLmZvckVhY2goZnVuY3Rpb24odGVzdGFiaWxpdHkpIHsgdGVzdGFiaWxpdHkud2hlblN0YWJsZShkZWNyZW1lbnQpOyB9KTtcbiAgICB9O1xuXG4gICAgaWYgKCFnbG9iYWwuZnJhbWV3b3JrU3RhYmlsaXplcnMpIHtcbiAgICAgIGdsb2JhbC5mcmFtZXdvcmtTdGFiaWxpemVycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUdyb3dhYmxlU2l6ZSgwKTtcbiAgICB9XG4gICAgZ2xvYmFsLmZyYW1ld29ya1N0YWJpbGl6ZXJzLnB1c2god2hlbkFsbFN0YWJsZSk7XG4gIH1cblxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6IFRlc3RhYmlsaXR5IHtcbiAgICBpZiAoZWxlbSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHQgPSByZWdpc3RyeS5nZXRUZXN0YWJpbGl0eShlbGVtKTtcbiAgICBpZiAoaXNQcmVzZW50KHQpKSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9IGVsc2UgaWYgKCFmaW5kSW5BbmNlc3RvcnMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoRE9NLmlzU2hhZG93Um9vdChlbGVtKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5LCBET00uZ2V0SG9zdChlbGVtKSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeSwgRE9NLnBhcmVudEVsZW1lbnQoZWxlbSksIHRydWUpO1xuICB9XG59XG4iXX0=