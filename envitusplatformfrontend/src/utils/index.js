export const findByDataTest = (component, attr) => {
    const wrapper = component.find(`[data-test='${attr}']`);
    return wrapper;
};

export function copyObjectValues(target, source) {
    Object.keys(target).map(function(key) {
        target[key] = source.hasOwnProperty(key) ? source[key] : target[key];
        return null
    });
    return target;
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
