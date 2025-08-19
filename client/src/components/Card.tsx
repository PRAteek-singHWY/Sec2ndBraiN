import { ShareIcon } from "../assets/icons/ShareIcon";
import { DeleteIcon } from "../assets/icons/DeleteIcon";
import { DocIcon } from "../assets/icons/DocIcon";

type linkType = "twitter" | "youtube";
interface CardProps {
  title: string;
  link: string;
  type: linkType;
}
export const Card = ({ title, link, type }: CardProps) => {
  return (
    <div>
      <div className="p-4 bg-white shadow-lg shadow-xl/20 rounded-md border-1 border-gray-200 max-w-72  ">
        <div className="flex justify-between text-md ">
          <div className="flex  text-gray-500 items-center">
            <div className="text-purple-600 border-1    ">
              <DocIcon size="md" />
            </div>
          </div>
          {title}
          <div className="flex gap-2 text-gray-500 items-center ">
            <a href={link} target="_blank" className="cursor-pointer ">
              <ShareIcon size="md" />
            </a>
            <div className="cursor-pointer">
              <DeleteIcon size="md" />
            </div>
          </div>
        </div>
        <div className="pt-4">
          {type === "youtube" && (
            <iframe
              className="w-full h-full"
              src={link.replace("watch", "embed").replace("?v=", "/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}

          {type === "twitter" && (
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
              <script
                async
                src="https://platform.twitter.com/widgets.js"
                charSet="utf-8"
              ></script>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};
