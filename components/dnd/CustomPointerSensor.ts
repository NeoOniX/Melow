import { PointerSensor } from "@dnd-kit/core";

export class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: { nativeEvent: PointerEvent }) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as Element)
        ) {
          return false;
        }

        return true;
      },
    },
  ];
}

function isInteractiveElement(element: Element): boolean {
  console.log("Checking if element is interactive:", element);
  const interactiveElements = [
    "button",
    "input",
    "textarea",
    "select",
    "option",
    "label",
    "p",
    "img",
  ];

  if (
    element?.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  ) {
    return true;
  }

  return false;
}
