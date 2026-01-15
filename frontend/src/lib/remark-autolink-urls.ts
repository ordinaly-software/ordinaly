import type { Literal, Node, Parent } from "unist";
import { visit } from "unist-util-visit";

const URL_REGEX = /(https?:\/\/[^\s<>()]+)|(www\.[^\s<>()]+)/g;

type TextNode = Literal & { value: string };

const ensureProtocol = (value: string) => {
  if (/^[a-zA-Z][\w-+.]?:\/\//.test(value)) {
    return value;
  }
  return `https://${value}`;
};

export const remarkAutolinkUrls = () => {
  return (tree: Parent) => {
    visit(tree, "text", (node: TextNode, index, parent) => {
      if (!parent || typeof index !== "number" || parent.type === "link") {
        return;
      }

      const { value } = node;
      if (typeof value !== "string" || !value) {
        return;
      }

      const segments: Node[] = [];
      let lastIndex = 0;
      const matcher = new RegExp(URL_REGEX);
      let match: RegExpExecArray | null;

      while ((match = matcher.exec(value)) !== null) {
        const url = match[0];
        const start = match.index;

        if (start > lastIndex) {
          segments.push({
            type: "text",
            value: value.slice(lastIndex, start),
          } as TextNode);
        }

        segments.push({
          type: "link",
          url: ensureProtocol(url),
          title: null,
          children: [
            {
              type: "text",
              value: url,
            },
          ],
        } as Node);

        lastIndex = start + url.length;
      }

      if (segments.length === 0) {
        return;
      }

      if (lastIndex < value.length) {
        segments.push({
          type: "text",
          value: value.slice(lastIndex),
        } as TextNode);
      }

      parent.children.splice(index, 1, ...segments);
    });
  };
};
