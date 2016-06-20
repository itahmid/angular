var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ElementAst, BoundDirectivePropertyAst, DirectiveAst } from 'angular2/compiler';
import { AstTransformer, LiteralArray, LiteralPrimitive } from 'angular2/src/compiler/expression_parser/ast';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/core';
import { Parser } from 'angular2/src/compiler/expression_parser/parser';
/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
class FixedPart {
    constructor(value) {
        this.value = value;
    }
}
/**
 * The square bracket
 */
class AuxiliaryStart {
    constructor() {
    }
}
/**
 * The square bracket
 */
class AuxiliaryEnd {
    constructor() {
    }
}
/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
class Params {
    constructor(ast) {
        this.ast = ast;
    }
}
class RouterLinkLexer {
    constructor(parser, exp) {
        this.parser = parser;
        this.exp = exp;
        this.index = 0;
    }
    tokenize() {
        let tokens = [];
        while (this.index < this.exp.length) {
            tokens.push(this._parseToken());
        }
        return tokens;
    }
    _parseToken() {
        let c = this.exp[this.index];
        if (c == '[') {
            this.index++;
            return new AuxiliaryStart();
        }
        else if (c == ']') {
            this.index++;
            return new AuxiliaryEnd();
        }
        else if (c == '(') {
            return this._parseParams();
        }
        else if (c == '/' && this.index !== 0) {
            this.index++;
            return this._parseFixedPart();
        }
        else {
            return this._parseFixedPart();
        }
    }
    _parseParams() {
        let start = this.index;
        for (; this.index < this.exp.length; ++this.index) {
            let c = this.exp[this.index];
            if (c == ')') {
                let paramsContent = this.exp.substring(start + 1, this.index);
                this.index++;
                return new Params(this.parser.parseBinding(`{${paramsContent}}`, null).ast);
            }
        }
        throw new BaseException("Cannot find ')'");
    }
    _parseFixedPart() {
        let start = this.index;
        let sawNonSlash = false;
        for (; this.index < this.exp.length; ++this.index) {
            let c = this.exp[this.index];
            if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
                break;
            }
            if (c != '.' && c != '/') {
                sawNonSlash = true;
            }
        }
        let fixed = this.exp.substring(start, this.index);
        if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
            throw new BaseException("Invalid router link");
        }
        return new FixedPart(fixed);
    }
}
class RouterLinkAstGenerator {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    generate() { return this._genAuxiliary(); }
    _genAuxiliary() {
        let arr = [];
        for (; this.index < this.tokens.length; this.index++) {
            let r = this.tokens[this.index];
            if (r instanceof FixedPart) {
                arr.push(new LiteralPrimitive(r.value));
            }
            else if (r instanceof Params) {
                arr.push(r.ast);
            }
            else if (r instanceof AuxiliaryEnd) {
                break;
            }
            else if (r instanceof AuxiliaryStart) {
                this.index++;
                arr.push(this._genAuxiliary());
            }
        }
        return new LiteralArray(arr);
    }
}
class RouterLinkAstTransformer extends AstTransformer {
    constructor(parser) {
        super();
        this.parser = parser;
    }
    visitQuote(ast, context) {
        if (ast.prefix == "route") {
            return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
        }
        else {
            return super.visitQuote(ast, context);
        }
    }
}
export function parseRouterLinkExpression(parser, exp) {
    let tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
}
/**
 * A compiler plugin that implements the router link DSL.
 */
export let RouterLinkTransform = class RouterLinkTransform {
    constructor(parser) {
        this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    visitNgContent(ast, context) { return ast; }
    visitEmbeddedTemplate(ast, context) { return ast; }
    visitElement(ast, context) {
        let updatedChildren = ast.children.map(c => c.visit(this, context));
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        let updatedDirectives = ast.directives.map(c => c.visit(this, context));
        return new ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.exportAsVars, updatedDirectives, ast.providers, ast.hasViewContainer, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    }
    visitVariable(ast, context) { return ast; }
    visitEvent(ast, context) { return ast; }
    visitElementProperty(ast, context) { return ast; }
    visitAttr(ast, context) { return ast; }
    visitBoundText(ast, context) { return ast; }
    visitText(ast, context) { return ast; }
    visitDirective(ast, context) {
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        return new DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.exportAsVars, ast.sourceSpan);
    }
    visitDirectiveProperty(ast, context) {
        let transformedValue = ast.value.visit(this.astTransformer);
        return new BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    }
};
RouterLinkTransform = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Parser])
], RouterLinkTransform);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ZODdXMzRUdC50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rX3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUVMLFVBQVUsRUFDVix5QkFBeUIsRUFDekIsWUFBWSxFQUViLE1BQU0sbUJBQW1CO09BQ25CLEVBQ0wsY0FBYyxFQUlkLFlBQVksRUFDWixnQkFBZ0IsRUFFakIsTUFBTSw2Q0FBNkM7T0FDN0MsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0RBQWdEO0FBRXJFOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixLQUFhO1FBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUFHLENBQUM7QUFDdEMsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRTtJQUFlLENBQUM7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRTtJQUFlLENBQUM7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztJQUFHLENBQUM7QUFDakMsQ0FBQztBQUVEO0lBR0UsWUFBb0IsTUFBYyxFQUFVLEdBQVc7UUFBbkMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFGdkQsVUFBSyxHQUFXLENBQUMsQ0FBQztJQUV3QyxDQUFDO0lBRTNELFFBQVE7UUFDTixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEMsTUFBTSxD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QUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFDckQsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7QUFDSCxDQUFDO0FBMUNEO0lBQUMsVUFBVSxFQUFFOzt1QkFBQTtBQTBDWiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgRWxlbWVudEFzdCxcbiAgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFxufSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5pbXBvcnQge1xuICBBc3RUcmFuc2Zvcm1lcixcbiAgUXVvdGUsXG4gIEFTVCxcbiAgRW1wdHlFeHByLFxuICBMaXRlcmFsQXJyYXksXG4gIExpdGVyYWxQcmltaXRpdmUsXG4gIEFTVFdpdGhTb3VyY2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuXG4vKipcbiAqIGUuZy4sICcuL1VzZXInLCAnTW9kYWwnIGluIC4vVXNlcltNb2RhbChwYXJhbTogdmFsdWUpXVxuICovXG5jbGFzcyBGaXhlZFBhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBUaGUgc3F1YXJlIGJyYWNrZXRcbiAqL1xuY2xhc3MgQXV4aWxpYXJ5U3RhcnQge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8qKlxuICogVGhlIHNxdWFyZSBicmFja2V0XG4gKi9cbmNsYXNzIEF1eGlsaWFyeUVuZCB7XG4gIGNvbnN0cnVjdG9yKCkge31cbn1cblxuLyoqXG4gKiBlLmcuLCBwYXJhbTp2YWx1ZSBpbiAuL1VzZXJbTW9kYWwocGFyYW06IHZhbHVlKV1cbiAqL1xuY2xhc3MgUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIGFzdDogQVNUKSB7fVxufVxuXG5jbGFzcyBSb3V0ZXJMaW5rTGV4ZXIge1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnNlcjogUGFyc2VyLCBwcml2YXRlIGV4cDogc3RyaW5nKSB7fVxuXG4gIHRva2VuaXplKCk6IEFycmF5PEZpeGVkUGFydCB8IEF1eGlsaWFyeVN0YXJ0IHwgQXV4aWxpYXJ5RW5kIHwgUGFyYW1zPiB7XG4gICAgbGV0IHRva2VucyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLmluZGV4IDwgdGhpcy5leHAubGVuZ3RoKSB7XG4gICAgICB0b2tlbnMucHVzaCh0aGlzLl9wYXJzZVRva2VuKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUb2tlbigpIHtcbiAgICBsZXQgYyA9IHRoaXMuZXhwW3RoaXMuaW5kZXhdO1xuICAgIGlmIChjID09ICdbJykge1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIG5ldyBBdXhpbGlhcnlTdGFydCgpO1xuXG4gICAgfSBlbHNlIGlmIChjID09ICddJykge1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIG5ldyBBdXhpbGlhcnlFbmQoKTtcblxuICAgIH0gZWxzZSBpZiAoYyA9PSAnKCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZVBhcmFtcygpO1xuXG4gICAgfSBlbHNlIGlmIChjID09ICcvJyAmJiB0aGlzLmluZGV4ICE9PSAwKSB7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VGaXhlZFBhcnQoKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VGaXhlZFBhcnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVBhcmFtcygpIHtcbiAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIGZvciAoOyB0aGlzLmluZGV4IDwgdGhpcy5leHAubGVuZ3RoOyArK3RoaXMuaW5kZXgpIHtcbiAgICAgIGxldCBjID0gdGhpcy5leHBbdGhpcy5pbmRleF07XG4gICAgICBpZiAoYyA9PSAnKScpIHtcbiAgICAgICAgbGV0IHBhcmFtc0NvbnRlbnQgPSB0aGlzLmV4cC5zdWJzdHJpbmcoc3RhcnQgKyAxLCB0aGlzLmluZGV4KTtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4gbmV3IFBhcmFtcyh0aGlzLnBhcnNlci5wYXJzZUJpbmRpbmcoYHske3BhcmFtc0NvbnRlbnR9fWAsIG51bGwpLmFzdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQ2Fubm90IGZpbmQgJyknXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VGaXhlZFBhcnQoKSB7XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICBsZXQgc2F3Tm9uU2xhc2ggPSBmYWxzZTtcblxuXG4gICAgZm9yICg7IHRoaXMuaW5kZXggPCB0aGlzLmV4cC5sZW5ndGg7ICsrdGhpcy5pbmRleCkge1xuICAgICAgbGV0IGMgPSB0aGlzLmV4cFt0aGlzLmluZGV4XTtcblxuICAgICAgaWYgKGMgPT0gJygnIHx8IGMgPT0gJ1snIHx8IGMgPT0gJ10nIHx8IChjID09ICcvJyAmJiBzYXdOb25TbGFzaCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChjICE9ICcuJyAmJiBjICE9ICcvJykge1xuICAgICAgICBzYXdOb25TbGFzaCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpeGVkID0gdGhpcy5leHAuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcblxuICAgIGlmIChzdGFydCA9PT0gdGhpcy5pbmRleCB8fCAhc2F3Tm9uU2xhc2ggfHwgZml4ZWQuc3RhcnRzV2l0aCgnLy8nKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJJbnZhbGlkIHJvdXRlciBsaW5rXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRml4ZWRQYXJ0KGZpeGVkKTtcbiAgfVxufVxuXG5jbGFzcyBSb3V0ZXJMaW5rQXN0R2VuZXJhdG9yIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9rZW5zOiBhbnlbXSkge31cblxuICBnZW5lcmF0ZSgpOiBBU1QgeyByZXR1cm4gdGhpcy5fZ2VuQXV4aWxpYXJ5KCk7IH1cblxuICBwcml2YXRlIF9nZW5BdXhpbGlhcnkoKTogQVNUIHtcbiAgICBsZXQgYXJyID0gW107XG4gICAgZm9yICg7IHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGg7IHRoaXMuaW5kZXgrKykge1xuICAgICAgbGV0IHIgPSB0aGlzLnRva2Vuc1t0aGlzLmluZGV4XTtcblxuICAgICAgaWYgKHIgaW5zdGFuY2VvZiBGaXhlZFBhcnQpIHtcbiAgICAgICAgYXJyLnB1c2gobmV3IExpdGVyYWxQcmltaXRpdmUoci52YWx1ZSkpO1xuXG4gICAgICB9IGVsc2UgaWYgKHIgaW5zdGFuY2VvZiBQYXJhbXMpIHtcbiAgICAgICAgYXJyLnB1c2goci5hc3QpO1xuXG4gICAgICB9IGVsc2UgaWYgKHIgaW5zdGFuY2VvZiBBdXhpbGlhcnlFbmQpIHtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIH0gZWxzZSBpZiAociBpbnN0YW5jZW9mIEF1eGlsaWFyeVN0YXJ0KSB7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgYXJyLnB1c2godGhpcy5fZ2VuQXV4aWxpYXJ5KCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5KGFycik7XG4gIH1cbn1cblxuY2xhc3MgUm91dGVyTGlua0FzdFRyYW5zZm9ybWVyIGV4dGVuZHMgQXN0VHJhbnNmb3JtZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnNlcjogUGFyc2VyKSB7IHN1cGVyKCk7IH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgaWYgKGFzdC5wcmVmaXggPT0gXCJyb3V0ZVwiKSB7XG4gICAgICByZXR1cm4gcGFyc2VSb3V0ZXJMaW5rRXhwcmVzc2lvbih0aGlzLnBhcnNlciwgYXN0LnVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0UXVvdGUoYXN0LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUm91dGVyTGlua0V4cHJlc3Npb24ocGFyc2VyOiBQYXJzZXIsIGV4cDogc3RyaW5nKTogQVNUIHtcbiAgbGV0IHRva2VucyA9IG5ldyBSb3V0ZXJMaW5rTGV4ZXIocGFyc2VyLCBleHAudHJpbSgpKS50b2tlbml6ZSgpO1xuICByZXR1cm4gbmV3IFJvdXRlckxpbmtBc3RHZW5lcmF0b3IodG9rZW5zKS5nZW5lcmF0ZSgpO1xufVxuXG4vKipcbiAqIEEgY29tcGlsZXIgcGx1Z2luIHRoYXQgaW1wbGVtZW50cyB0aGUgcm91dGVyIGxpbmsgRFNMLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVyTGlua1RyYW5zZm9ybSBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgYXN0VHJhbnNmb3JtZXI7XG5cbiAgY29uc3RydWN0b3IocGFyc2VyOiBQYXJzZXIpIHsgdGhpcy5hc3RUcmFuc2Zvcm1lciA9IG5ldyBSb3V0ZXJMaW5rQXN0VHJhbnNmb3JtZXIocGFyc2VyKTsgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBsZXQgdXBkYXRlZENoaWxkcmVuID0gYXN0LmNoaWxkcmVuLm1hcChjID0+IGMudmlzaXQodGhpcywgY29udGV4dCkpO1xuICAgIGxldCB1cGRhdGVkSW5wdXRzID0gYXN0LmlucHV0cy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICBsZXQgdXBkYXRlZERpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRBc3QoYXN0Lm5hbWUsIGFzdC5hdHRycywgdXBkYXRlZElucHV0cywgYXN0Lm91dHB1dHMsIGFzdC5leHBvcnRBc1ZhcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWREaXJlY3RpdmVzLCBhc3QucHJvdmlkZXJzLCBhc3QuaGFzVmlld0NvbnRhaW5lciwgdXBkYXRlZENoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QubmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEV2ZW50KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEF0dHIoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0VGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB1cGRhdGVkSW5wdXRzID0gYXN0LmlucHV0cy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZUFzdChhc3QuZGlyZWN0aXZlLCB1cGRhdGVkSW5wdXRzLCBhc3QuaG9zdFByb3BlcnRpZXMsIGFzdC5ob3N0RXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5leHBvcnRBc1ZhcnMsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB0cmFuc2Zvcm1lZFZhbHVlID0gYXN0LnZhbHVlLnZpc2l0KHRoaXMuYXN0VHJhbnNmb3JtZXIpO1xuICAgIHJldHVybiBuZXcgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdChhc3QuZGlyZWN0aXZlTmFtZSwgYXN0LnRlbXBsYXRlTmFtZSwgdHJhbnNmb3JtZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG59Il19