import axios, {AxiosError} from 'axios';
import imm from 'object-path-immutable';

export const jsonContentTypes = [
  'application/json',
  'application/vnd.api+json'
];

const hasValidContentType = response => jsonContentTypes.some(
  contentType => response.headers['content-type'].indexOf(contentType) > -1
);

export const noop = () => {};

export const apiRequest = (url, options = {}) => {
  const allOptions = imm(options)
    .set('url', url)
    .set(['headers', 'Accept'], 'application/vnd.api+json')
    .set(['headers', 'Content-Type'], 'application/vnd.api+json')
    .value();

  return axios(allOptions)
    .then(res => {
      if (res.status === 204) {
        return res;
      }

      if (hasValidContentType(res) === false) {
        throw AxiosError(
          'Invalid Content-Type in response',
          null,
          res.config,
          res
        );
      }

      return res.data;
    });
};

export const hasOwnProperties = (obj, propertyTree) => {
  if ((obj instanceof Object) === false) {
    return false;
  }
  const property = propertyTree[0];
  const hasProperty = obj.hasOwnProperty(property);
  if (hasProperty) {
    if (propertyTree.length === 1) {
      return hasProperty;
    }
    return hasOwnProperties(obj[property], propertyTree.slice(1));
  }
  return false;
};

export const getPaginationUrl = (response, direction, path) => {
  if (!response.links || !hasOwnProperties(response, ['links', direction])) {
    return null;
  }

  let paginationUrl = response.links[direction];
  if (!paginationUrl) {
    return null;
  }

  if (hasOwnProperties(response.links[direction], ['href'])) {
    paginationUrl = response.links[direction].href;
  }
  return paginationUrl.replace(`${path}/`, '');
};
