'use strict';

export function extractInternal(el) {
    var win = el.ownerDocument.defaultView;
    var $ = win.$ || win.jQuery
    var BEM = $.fn.bem && $('<i>').bem(NAMESPACE).constructor;
    if (!BEM) {
        throw new Error('no BEM');
    }
    if (!$) {
        throw new Error('no jQuery');
    }
    function buildClass(b,e,m,v) {
        if (BEM.INTERNAL) {
            return BEM.INTERNAL.buildClass(b,e,m,v);
        } else if (BEM.blocks['i-bem__dom'].buildClass) {
            return BEM.blocks['i-bem__dom'].buildClass.call({_name: b}, e,m,v)
        }
    }
    var internal = {
        BEM: BEM,
        $: $,
        MOD_DELIM: '_',
        ELEM_DELIM: '__',
        NAME_PATTERN: '[a-zA-Z0-9-]+',
        buildClass: buildClass
    };
    // if (BEM) {
    //     // try old bem
    //     if (BEM.INTERNAL) {
    //         // buildString = BEM.INTERNAL.buildClass('b', 'e', 'm', 'v');
    //         internal = BEM.INTERNAL;
    //     // try new bem
    //     } else if (window.modules) {
    //         // buildString = BEM.blocks['i-bem__dom'].buildClass.call({_name: 'b'}, 'e', 'm', 'v')
    //         internal = modules.require('i-bem__internal', function)
    //     }
    // }
    return internal;
}

export function extractMods(elem, name) {
    var INTERNAL = this.extractInternal(elem);
    var res = {};
    var MOD_DELIM = INTERNAL.MOD_DELIM;
    var NAME_PATTERN = INTERNAL.NAME_PATTERN;
    var regexp = new RegExp([
            '(\\s|^)',
            name,
            MOD_DELIM,
            '(',
            NAME_PATTERN,
            ')',
            MOD_DELIM,
            '(',
            NAME_PATTERN,
            ')(?=\\s|$)'
        ].join(''), 'g');

    (elem.className.match(regexp) || []).forEach((className) => {
        var iModVal = (className = className.trim()).lastIndexOf(MOD_DELIM),
            iModName = className.substr(0, iModVal - 1).lastIndexOf(MOD_DELIM);
        res[className.substr(iModName + 1, iModVal - iModName - 1)] = className.substr(iModVal + 1);
    });
    return res;
}

export function getEntities() {

    var self = this; // window[NAMESPACE]
    var el = $0;
    var INTERNAL = this.extractInternal(el);
    var NAME_PATTERN = INTERNAL.NAME_PATTERN;
    var ELEM_DELIM = INTERNAL.ELEM_DELIM;
    var blockRegex = new RegExp('^' + NAME_PATTERN + '$');
    var elemRegex = new RegExp('^(' + NAME_PATTERN + ')' + ELEM_DELIM + '(' + NAME_PATTERN + ')$');
    var classes = Array.prototype.slice.call(el.classList || [], 0);
    var res = {
        entities: {}
    };
    var hasIBem = false;
    classes.forEach((className) => {
        if (className === 'i-bem') {
            hasIBem = true;
            return;
        }
        if (blockRegex.test(className)) {
            var mods = self.extractMods(el, className);
            res.entities[className] = {
                block: className,
                mods: mods
            }
        } else if (elemRegex.test(className)) {
            var mods = self.extractMods(el, className);
            var parts = className.match(elemRegex);
            res.entities[className] = {
                block: parts[1],
                elem: parts[2],
                mods: mods
            }
            var parentBlock = el.closest('.' + INTERNAL.buildClass(parts[1]));
            if (parentBlock) {
                res.entities[className].parent = {
                    tag: parentBlock.tagName,
                    class: parentBlock.className
                }
            }
        }
    });
    var bemData = el.dataset && el.dataset.bem;
    if (bemData) {
        var jsData = JSON.parse(bemData);
        Object.keys(jsData).forEach((name) => {
            var entity = res.entities[name] = res.entities[name] || {};
            entity.params = jsData[name];
            entity.iBem = hasIBem && !!INTERNAL.BEM.blocks[name];
            entity.liveInit = entity.iBem && !!INTERNAL.BEM.blocks[name]._liveInitable;
        });
    }
    return res;
}

export function modAdd(owner, mod, originalMod) {
    var el = $0;
    var INTERNAL = this.extractInternal(el);
    var isElem = !!owner.elem;
    var parent = isElem && this.findParent(el, owner.block, owner.elem);
    var blockInitedClass = INTERNAL.buildClass(owner.block, 'js', 'inited');
    if ((isElem && parent && parent.classList.contains(blockInitedClass)) || el.classList.contains(blockInitedClass)) {
        if (isElem) {
            var block = INTERNAL.$(parent).bem(owner.block);
            if (originalMod && (originalMod.name !== mod.name)) {
                block.delMod(INTERNAL.$(el), originalMod.name);
            }
            block.setMod(INTERNAL.$(el), mod.name, mod.value);
        } else {
            var block = INTERNAL.$(el).bem(owner.block);
            if (originalMod && (originalMod.name !== mod.name)) {
                block.delMod(originalMod.name);
            }
            block.setMod(mod.name, mod.value);
        }
    } else {
        var classList = el.classList;
        var maskToRemove = [INTERNAL.buildClass(owner.block, owner.elem, mod.name, '.+')];
        if (originalMod && originalMod.name && (originalMod.name !== mod.name)) {
            maskToRemove.push(INTERNAL.buildClass(owner.block, owner.elem, originalMod.name, '.+'))
        }
        var regexToRemove = new RegExp('^(' + maskToRemove.join('|') + ')$');
        var classListArray = Array.prototype.slice.call(classList, 0);
        var classToRemove = classListArray.filter((className) => {
            return regexToRemove.test(className);
        });
        classToRemove.forEach((className) => {
            classList.remove(className);
        });
        var newClass = INTERNAL.buildClass(owner.block, owner.elem, mod.name, mod.value);
        classList.add(newClass);
    }
}

export function modRemove(owner, mod, originalMod) {
    var el = $0;
    var INTERNAL = this.extractInternal(el);
    var isElem = !!owner.elem;
    var parent = isElem && this.findParent(el, owner.block, owner.elem);
    var blockInitedClass = INTERNAL.buildClass(owner.block, 'js', 'inited');
    if ((isElem && parent && parent.classList.contains(blockInitedClass)) || el.classList.contains(blockInitedClass)) {
        if (isElem) {
            INTERNAL.$(parent).bem(owner.block).delMod(INTERNAL.$(el), originalMod.name);
        } else {
            INTERNAL.$(el).bem(owner.block).delMod(originalMod.name);
        }
    } else {
        var classList = el.classList;
        var deleteClass = INTERNAL.buildClass(owner.block, owner.elem, originalMod.name, originalMod.value);
        classList.remove(deleteClass);
    }
}

export function findParent(el, block, elem) {
    var INTERNAL = this.extractInternal(el);
    var parent = el.closest('.' + INTERNAL.buildClass(block));
    return parent;
}

export function inspectParent(block, elem) {
    var el = $0;
    var parent = this.findParent(el, block, elem);
    if (parent) {
        inspect(parent);
    }
}
