import Markdown from "markdown-it";
import highlight from "highlight.js";
import 'highlight.js/styles/atom-one-dark.css'

const mdOptions: Markdown.Options = {
  linkify: true,
  typographer: true,
  breaks: true,
  langPrefix: "language-",
  highlight(str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          highlight.highlight(lang, str, true).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return "";
  },
};

export const md = new Markdown(mdOptions);