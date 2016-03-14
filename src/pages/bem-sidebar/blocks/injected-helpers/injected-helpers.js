'use strict';

export function extractMods(elem, name) {
    var res = {};
    var MOD_DELIM = BEM.INTERNAL.MOD_DELIM;
    var NAME_PATTERN = BEM.INTERNAL.NAME_PATTERN;
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

    if (!BEM) {
        throw new Error('No BEM on page');
    }

    var self = this; // window[NAMESPACE]
    var el = $0;
    var NAME_PATTERN = BEM.INTERNAL.NAME_PATTERN;
    var ELEM_DELIM = BEM.INTERNAL.ELEM_DELIM;
    var blockRegex = new RegExp('^' + NAME_PATTERN + '$');
    var elemRegex = new RegExp('^(' + NAME_PATTERN + ')' + ELEM_DELIM + '(' + NAME_PATTERN + ')$');
    var classes = Array.prototype.slice.call(el.classList, 0);
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
        }
    });
    var bemData = el.dataset && el.dataset.bem;
    if (bemData) {
        var jsData = JSON.parse(bemData);
        Object.keys(jsData).forEach((name) => {
            var entity = res.entities[name] = res.entities[name] || {};
            entity.params = jsData[name];
            entity.iBem = hasIBem && !!BEM.blocks[name];
            entity.liveInit = entity.iBem && !!BEM.blocks[name]._liveInitable;
        });
    }
    return res;
}

export function modAdd(owner, mod) {
    var el = $0;
    var classList = el.classList;
    var elInitedClass = BEM.INTERNAL.buildClass(owner.block, 'js', 'inited');
    var isElInited = classList.contains(elInitedClass);
    if (isElInited) {
        $(el).bem(owner.block).setMod(mod.name, mod.value);
    } else {
        var oldClass = BEM.INTERNAL.buildClass(owner.block, owner.elem, mod.name, '.+');
        var newClass = BEM.INTERNAL.buildClass(owner.block, owner.elem, mod.name, mod.value);
        var modRegex = new RegExp('^' + oldClass + '$');
        var classListArray = Array.prototype.slice.call(classList, 0);
        var classToRemove = classListArray.filter((className) => {
            return modRegex.test(className);
        });
        classToRemove.forEach((className) => {
            classList.remove(className);
        });
        classList.add(newClass);
    }
}

export function modRemove(owner, mod) {
    var el = $0;
    var classList = el.classList;
    var elInitedClass = BEM.INTERNAL.buildClass(owner.block, 'js', 'inited');
    var isElInited = classList.contains(elInitedClass);
    if (isElInited) {
        $(el).bem(owner.block).delMod(mod.name);
    } else {
        var deleteClass = BEM.INTERNAL.buildClass(owner.block, owner.elem, mod.name, mod.value);
        classList.remove(deleteClass);
    }
}
