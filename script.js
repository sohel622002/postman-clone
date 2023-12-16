import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditors from "./setupEditor";

const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector("[data-request-header]");
const keyValueTemplate = document.querySelector("[data-key-value-template]");
const responseHeaders = document.querySelector("[data-response-headers]");
const form = document.querySelector("[data-form]");

const { requestEditor, updateResponseEditor } = setupEditors()


axios.interceptors.request.use((req) => {
  req.customData = req.customData || {};
  req.customData.startTime = new Date().getTime();
  return req;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

function updateEndTime(res) {
  res.customData = res.customData || {};
  res.customData.time = new Date().getTime() - res.config.customData.startTime;
  return res;
}

function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}

function keyValuePairToObject(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;

    if (key === "") return data;
    return { ...data, [key]: value };
  }, {});
}

function updateResponseHeaders(headers) {
  responseHeaders.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeaders.append(keyElement);
    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeaders.append(valueElement);
  });
}

function updateResponseDetails(res) {
  document.querySelector("[data-status]").textContent = res.status;
  document.querySelector("[data-time]").textContent = res.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(res.data).length + JSON.stringify(res.headers).length
  );
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  let data
  try{
    data = JSON.parse(requestEditor.state.doc.toString() || null)
  } catch (e) {
    alert('JSON Data malformed!')
    return
  }

  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairToObject(queryParamsContainer),
    headers: keyValuePairToObject(requestHeadersContainer),
  })
    .catch((e) => e)
    .then((response) => {
      document
        .querySelector("[data-response-section]")
        .classList.remove("d-none");
      updateResponseDetails(response);
      updateResponseEditor(response.data);
      updateResponseHeaders(response.headers);
    });
});

document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

document
  .querySelector("[data-add-request-heade-btn]")
  .addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair());
  });

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());
