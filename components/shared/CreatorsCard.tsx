import Image, { StaticImageData } from "next/image";
import { H5, P1, SubH1 } from "../typography";

// ASSETS
import heartIcon from "@/assets/heart.png";
import Link from "next/link";
import { getRedirectRouteByRole } from "@/helper/roleHelper";

const CreatorCard = ({
  img,
  username,
  title,
  description,
  supporters,
  link="",
  header_image,
}: {
  img: StaticImageData;
  username: string;
  title: string;
  description: string;
  supporters: number;
  link:string;
  header_image:string;
}) => {


  return (
    <Link
      href={getRedirectRouteByRole(link, username)}
      className="rounded overflow-hidden bg-white md:w-[22rem]"
    >
      {/* top  */}
      <div className="relative h-40">
        <Image 
        src={header_image ?? img}
        className="pt-2 relative h-40"
        alt={username}
        width={400}
        height={250}
        />
        <Image
          src={img}
          alt={username}
          width={40}
          height={40}
          style={{ borderRadius: "50%", overflow: "hidden", width: "40px", height: "40px" }}
          className="absolute z-0 -bottom-6 right-6 border-4 border-white"
        />
      </div>
      {/* bottom  */}
      <div className="space-y-2 p-5 border border-gray-200 rounded-br rounded-bl">
        <SubH1 className="text-appGray-500">@{username}</SubH1>
        <H5 className="text-ellipsis pr-6 overflow-hidden">{title}</H5>
        <P1>{description}</P1>
        <P1 className="flex gap-1.5 items-center">
          <span className="">
            <Image src={heartIcon} alt="cover photo" />
          </span>
          {supporters} supporters
        </P1>
      </div>
    </Link>
  );
};

export default CreatorCard;
