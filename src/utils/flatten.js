// @flow
const methods = new Set([
  'CONNECT',
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE',
]);

function dive(currentKey: string, into: Object, target: Object) {
  Object.keys(into).forEach((key: string) => {
    if (methods.has(key.toUpperCase())) {
      target[currentKey] = Object.keys(into).reduce(
        (final: Object, key: string) => {
          if (methods.has(key.toUpperCase())) {
            return {...final, [key.toUpperCase()]: into[key]};
          }

          return final;
        },
        {...target[currentKey]}
      );
    } else {
      let newKey = key;
      const newVal = into[key];

      if (currentKey.length > 0) {
        newKey = currentKey + key;
      }

      if (typeof newVal === 'object') {
        dive(newKey, newVal, target);
      } else {
        target[newKey] = newVal;
      }
    }
  });
}

export default function flatten(obj: Object): Object {
  const newObj = {};
  dive('', obj, newObj);
  return newObj;
}
