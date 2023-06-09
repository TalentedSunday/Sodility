"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
// COMPONENTS
import {
  AudioArticle,
  ImageArticle,
  TextArticle,
  VideoArticle,
} from "@/components/pages/creator";
import { Button, Pagination, SocialMedias } from "@/components/shared";
import { H2, H3, H4, H5, P1, SubH1, SubH2 } from "@/components/typography";

// ASSETS
import addPostIcon from "@/assets/add-post.svg";
import imagePlaceholder from "@/assets/creator/image-article-placeholder.png";
import videoPlaceholder from "@/assets/creator/post-video.png";
import heartIcon from "@/assets/heart.png";
import cardUserImgPlaceholder from "@/assets/index/avatar.png";
import userIcon from "@/assets/user.png";
import banner from '@/assets/creator/banner.png';
// support
import fanIcon from "@/assets/creator/fan.png";
import oneOffIcon from "@/assets/creator/one-off.png";
import superFanIcon from "@/assets/creator/super-fan.png";
import supporterIcon from "@/assets/creator/supporter.png";
import { openModal } from "@/context/features/modal/modalSlice";
import { useAppDispatch } from "@/context/hooks";
import { useEffect, useState } from "react";
import {  useRouter, usePathname } from "next/navigation";
import { getLocaleData } from "../../../service/localStorageService";
import CanvasJSReact from '../../utils/canvas.min.js';
// ======================================================
// CREATOR PAGE COMPONENT ===============================
// ======================================================

// API

import { extentionHandler } from "../../utils/handler";
import { getContentByCreatorIdApi } from "@/http/contentApi";
import { followACreator, getCreatorByIdApi, getCreatorFollowers, getCreatorTiers, UnfollowACreator } from "@/http/creatorApi";
import { errorToast, successToast } from "@/helper/toster";
import { Loaders } from "@/ui-kits/Loaders";
import { getSupporterTransactions } from "@/app/api/admin/dashboard";
import { getSupporterLatestSubscription } from "@/http/supporterApi";
import { getDateandTime } from "@/app/utils/commonMethods";


export default function CreatorAdminPage() {
  const pathname = usePathname();
  const username = pathname.split('/').join('')  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [Follow, setFollow] = useState<boolean>(false);
  const [flwrsCount, setFlwrsCount] = useState<number>();
  const [loginUserId, setLoginUserId] = useState<string>();
  const [content, setContent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  const [latestSupporterSubscription, setLatestSuppoterSubscription] = useState<any>();

  const [options, setOptions] = useState({
    animationEnabled: true,

    axisX: {
      valueFormatString: "MMM",
     
    },
    axisY: {
      title: "",
      minimum: 0,
      maximum: 10,
      interval: 1
    },
    data: [{
      type: "spline",
      dataPoints: []
    }]
  })

  const followAUser = () => {
    if (data?._id) {
      followACreator(data?._id).then(() => {

        getCreatorByIdApi(data?.username || "").then((_data) => {
          setIsLoading(false);
          setData(_data);
        });
        getCreatorFollowers(data?._id).then((flwrs) => {
          setFlwrsCount(flwrs?.count);
        });
        successToast('you have follow a user');
        setFollow(true);  

        })
    }
    else {
      errorToast('User Id Not Found');
    }  
  }

  const UnfollowAUser = () => {
    if (data?._id) {
      UnfollowACreator(data?._id).then(() => {

        getCreatorByIdApi(data?.username || "").then((_data) => {
          setIsLoading(false);
          setData(_data);
        });
        getCreatorFollowers(data?._id).then((flwrs) => {
          setFlwrsCount(flwrs?.count);
        });
        successToast('you have unfollow a user');
        setFollow(true);  
        })
    }
    else {
      errorToast('User Id Not Found');
    }  
  }

  useEffect(() => {
    const loginUserID = getLocaleData('user')?._id;
    setLoginUserId(loginUserID);
    setLoading(true);
    
    setIsLoading(true);
    if (username) {
      getCreatorByIdApi(username || "").then((_data) => {
        if (_data) {
          setIsLoading(false);
          setData(_data);
          getCreatorFollowers(_data?._id).then((flwrs) => {
            if (flwrs) setFlwrsCount(flwrs?.count);
          })
          if (_data?._id) {
            getContentByCreatorIdApi(_data?._id).then((data: any) => {
              // if(res.data.status === 200 && res.data.msg === 'success') {
              if (data && data?.length > 0) {
                const _data = data.map((item: any) => {
                  item.ipfs_url =
                    item.ipfs_url && item.ipfs_url.includes("http")
                      ? item.ipfs_url
                      : "";
                  return {
                    articleType: {
                      content: extentionHandler(item.type || "audio"),
                      status: item.locked ? "locked" : "",
                    },
                    userId: item.user_id,
                    content: item.body || "",
                    img: cardUserImgPlaceholder,
                    video: item.ipfs_url
                      ? {
                          blurDataURL: item.ipfs_url,
                          blurHeight: 4,
                          blurWidth: 8,
                          height: 431,
                          src: item.ipfs_url,
                          width: 768,
                        }
                      : videoPlaceholder,
                    metadata: item.created_at,
                    title: item.title,
                    image: item.ipfs_url
                      ? {
                          src: item.ipfs_url,
                          height: 61,
                          width: 60,
                          blurDataURL: item.ipfs_url,
                          blurWidth: 8,
                          blurHeight: 8,
                        }
                      : "",
                  };
                });
                setContent(_data);
                setLoading(false);
                // } else {
                //   setLoading(false);
                // }
              } else {
                setLoading(false);
                setContent([]);
                // errorToast('Unable to fetch creator content')
                // alert('Unable to fetch data');
              }
            });
          }
        }
       
      });
    } else {
      setIsLoading(false);
      setData(null);
      errorToast("creator doesn't existed");
    }
  }, [username, Follow]);

 useEffect(() => {
      getSupporterTransactions(username).then((res: any) => {
        if(res?.data?.status === 200 && res?.data?.msg === 'success') {
          const Arr = res?.data?.data;
          const date1 = new Date(1687961117 * 1000).toISOString();
          const date2 = new Date(1690553117 * 1000).toISOString();

            const newDataPoints = Arr?.map((item: any) => {
              return {   
                    type: 'spline',
                    dataPoints: [
                      {x: new Date(item.created_at), y: 1},
                      {x: new Date(date1), y: 1},
                      {x: new Date(date2), y: 4}
                    ]
              }
          })
          setOptions({...options, data: newDataPoints})
        }
      })
   
  }, [username])

  useEffect(() => {

    const role = getLocaleData('user')?.role;
    const token = getLocaleData("token");

    if (role === 'supporter') 
      getSupporterLatestSubscription(token,username).then((res: any) => {
        setLatestSuppoterSubscription(res);
      })
  }, [username])
return React.useMemo(() => {
  return (
    <main>
       <Image 
        src={data?.header_image ? data?.header_image : banner}
        alt=""
        width={900}
        height={300}
        className="w-full h-60 object-cover"
        />
      <section className="md:w-[90%] mx-auto  px-6 py-8 pb-28"> 
        <CreatorInfo
          img={data?.profile_image || cardUserImgPlaceholder}
          username={data?.username || "N/A"}
          bio={data?.bio || "N/A"}
          supporters={data?.supporters || 0}
          followers={data?.followers || 0} loginUserID={loginUserId}
          isLoading={isLoading} searchQuery={data?._id}
          Follow={data?.creator_followers?.includes(loginUserId)} userId={data?._id} followerCount={flwrsCount}
          followAUser={data?.creator_followers?.includes(loginUserId) ? UnfollowAUser : followAUser}
        />
        {getLocaleData('user')?.role === 'creator' ? <SupportSection username={username}/> : null }
        {getLocaleData('user')?.role === 'supporter' ? 
        <div className="my-10 flex flex-col md:flex-row gap-8 justify-between text-center">
            <div className="rounded border border-appGray-450 py-3 px-5 hover:shadow-sm justify-center w-72 flex flex-col items-center gap-4 mb-4">
              <Image
                src={supporterIcon}
                alt={" icon"}
                width={50}
                // className="rounded-full p-1 border border-appGray-400"
              />
              <div className="space-y-1 text-center">
                <H5>Current Supporting Average</H5>
                <div className="flex gap-2 justify-center items-baseline">
                  <H3>{`$${parseFloat(latestSupporterSubscription?.average_donate ?? 0).toFixed(2)}`}</H3>
                  <SubH2 className="capitalize">per month</SubH2>
                </div>
              </div>
              <Button className="px-8 my-2" action={() => {}}>
                Top Up
              </Button>
              {latestSupporterSubscription ? (
                <div className="">
                  <P1 className="leading-6">
                    You last donated <b>{`$${parseFloat(latestSupporterSubscription?.donate ?? 0).toFixed(2)}`}</b> <br />
                    on <b>{`${getDateandTime(latestSupporterSubscription?.created_at)}`}</b>
                    </P1> 
                </div>
              ) : null}
            </div>
            <div className="flex-1 rounded border h-full border-appGray-450 p-8 hover:shadow-sm flex justify-center">
                <div className="w-full h-full text-end flex flex-col justify-between">
                  <P1 className="font-semibold text-appGray-500">
                    View Supporter Levels
                  </P1>
                    {latestSupporterSubscription ? <div>
                      <CanvasJSChart options = {options}
                      />
                    </div> : <div className="flex justify-center p-16">No graph plotted against this creator because you have not donated anything.</div>}
                </div>
            </div>
        </div>
        : null }

        <div className="flex flex-col md:flex-row gap-8">
          <div className="space-y-3">
            { data?._id !== loginUserId ? null : !loginUserId ? null : (
              <Button
              className="w-full py-4 flex items-center gap-2 justify-center"
              action={() => {
                dispatch(openModal("addPost"));
              }}
              >
              <Image
                src={addPostIcon}
                alt="add post icon"
                width={20}
                height={20}
              />
              <span>Add a Post</span>
              </Button>
            )}            
            <SideBar
              mediaLink={{
                facebook: data?.facebook,
                twitter: data?.twitter,
                youtube: data?.youtube,
              }}
            />
          </div>
          <CreatorContent creatorId={data?._id} content={content} loading={loading} />
        </div>
      </section>
    </main>
);
}, [CanvasJSChart, UnfollowAUser, content, data?._id, data?.bio, data?.creator_followers, data?.facebook, data?.followers, data?.header_image, data?.profile_image, data?.supporters, data?.twitter, data?.username, data?.youtube, dispatch, flwrsCount, followAUser, isLoading, latestSupporterSubscription, loading, loginUserId, options, username])
  
}

// EXTENDED COMPONENTS =================================
const CreatorInfo = ({
  img,
  username,
  bio,
  followerCount,
  Follow,
  searchQuery,
  loginUserID,
  supporters,
  followers,
  followAUser,
  isLoading,
}: {
  img: StaticImageData;
  username: string;
  bio: string;
  followerCount: number | null | undefined;
  supporters: number;
  loginUserID?: string | null;
  followers: number | null;
  Follow: boolean | null;
  searchQuery?: string | null;
  userId: string | null;
  followAUser?: any;
  isLoading: boolean;
}) => {
  const dispatch = useAppDispatch();
  if (isLoading)
    return (
      <div className="flex flex-col items-center rounded border border-appGray-450 hover:shadow-sm py-10">
        {" "}
        Loading ...{" "}
      </div>
    );
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between">
      {/* left - user  */}
      <div className="flex items-center gap-6">
        <div className="w-30 h-30 rounded-full">
          <Image
            src={img}
            alt={username}
            width={100}
            height={100}
            className="rounded-full p-1 border border-appGray-400"
          />
        </div>
        <div className="flex flex-col">
          <SubH1 className="text-appGray-500">@{username}</SubH1>
          <H4>{bio}</H4>
          <div className="flex gap-4 capitalize mt-2">
            <P1 className="flex gap-1.5 items-center">
              <span className="">
                <Image src={userIcon} alt="user icon" />
              </span>
              {followerCount ? followerCount : '0'} followers
            </P1>
            <P1 className="flex gap-1.5 items-center">
              <span className="">
                <Image src={heartIcon} alt="heart icon" />
              </span>
              {supporters} supporters
            </P1>
          </div>
        </div>
      </div>
      {/* right - buttons  */}

      {searchQuery === loginUserID ? null : !loginUserID ? null : (
      <div className="flex items-center justify-center md:justify-start gap-4">
            <Button variant="primary-outline" action={() => followAUser()}>
              {Follow ? 'Unfollow' : 'Follow'}
            </Button>
            <Button action={() => dispatch(openModal("donate"))}>Donate</Button>
        </div>
        )}
     
    </div>
  );
};

const SupportSection = ({username}: any) => {
  const Card = ({
    img,
    width = 100,
    title,
    amount,
    action,
    subH = true,
  }: {
    img: StaticImageData;
    width?: number;
    title: string;
    amount: string;
    action: () => void;
    subH?: boolean;
  }) => {

    return (
      <div className="rounded border border-appGray-450 py-3 px-5 w-96 hover:shadow-sm flex justify-center">
        <div className="w-14 flex flex-col items-center gap-4 my-10">
          <Image
            src={img}
            alt={title + " icon"}
            width={width}
            // className="rounded-full p-1 border border-appGray-400"
          />
          <div className="space-y-1 mb-2">
            <H5 className="!font-normal">{title}</H5>
            <H3>{amount}</H3>
            {subH && <SubH2 className="capitalize">per month</SubH2>}
          </div>
          {/* button  */}
          <Button className="px-8" action={action}>
            Join
          </Button>
        </div>
      </div>
    );
  };

  const [tiers, setTiers] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
      setLoading(true);
      getCreatorTiers(username).then((res) => {
        setTiers(res);
        setLoading(false);   
      })
    }, []);

  return (
    <div className="my-10 flex flex-col md:flex-row gap-5 justify-between items-center text-center">
      {loading ? <Loaders /> : (
      <> 
      {tiers?.tier_one_name || tiers?.tier_one_price || tiers?.tier_three_price || tiers?.tier_two_name || tiers?.tier_three_name || tiers?.tier_two_price ? (
        <>
          <Card
          img={supporterIcon}
          title={tiers?.tier_one_name ? tiers?.tier_one_name : 'No Tier 1'}
          amount={`$${tiers?.tier_one_price ? tiers?.tier_one_price.toFixed(2) : 0.00}`}
          action={() => {}}
        />
          <Card
            img={fanIcon}
            width={42}
            title={tiers?.tier_two_name ? tiers?.tier_two_name : "No Tier 2"}
            amount={`$${tiers?.tier_two_price ? tiers?.tier_two_price.toFixed(2) : 0.00}`}
            action={() => {}}
          />
          <Card
            img={superFanIcon}
            width={38}
            title={tiers?.tier_three_name ? tiers?.tier_three_name : 'No Tier 3'}
            amount={`$${tiers?.tier_three_price ? tiers?.tier_three_price.toFixed(2) : 0.00}`}
            action={() => {}}
          />
          <Card
            img={oneOffIcon}
            width={38}
            title={'One-off donation'}
            amount={''}
            action={() => {}}
          />
        </>
      ): <p className="flex justify-center">{"This user doesn't has any tiers"}</p>}       
        
      </>

      )}
      
    </div>
  );
};

const SideBar = ({ mediaLink }: any) => {
  return (
    <aside className="h-fit rounded border border-appGray-450 p-8  w-72 hover:shadow-sm flex justify-center">
      <div className="space-y-4">
        <H5>Digital Cash Network</H5>
        <P1>
          Documenting the global digital cash revolution, the greatest financial
          revolution the world has seen in recent times.
        </P1>
        <P1>
          Podcasts, news videos, interviews, articles, and more about the
          exciting world of cryptocurrency, blockchain tech, and
          decentralization.
        </P1>
        {/* social media  */}
        <SocialMedias {...mediaLink} />
      </div>
    </aside>
  );
};

const CreatorContent = ({ creatorId, content, loading }: any) => {
  // const content1 = [
  //   {
  //     articleType: {
  //       content: "video",
  //       status: "locked",
  //     },
  //     img: cardUserImgPlaceholder,
  //     video: videoPlaceholder,
  //     metadata: "APR 16, 2021 AT 5:36 PM",
  //     title:
  //       "See Something Say Something Online takes aim at Freedom of Speech",
  //   },
  //   {
  //     articleType: {
  //       content: "audio",
  //       status: "locked",
  //     },
  //     img: cardUserImgPlaceholder,
  //     metadata: "APR 16, 2021 AT 5:36 PM ",
  //     title: "Interview: Roger Ver on Dash",
  //   },
  //   {
  //     articleType: {
  //       content: "text",
  //       status: "locked",
  //     },
  //     img: cardUserImgPlaceholder,
  //     metadata: "APR 16, 2021 AT 5:36 PM",
  //     title: "Cryptocurrency's Usability Crisis",
  //     content:
  //       "Next month marks the 11th anniversary of Bitcoin Pizza Day, the first recorded instance of an item purchased with cryptocurrency. Over the following decade we've seen an absolute explosion in both interest and investment into the digital currency space. Despite this, however, we've seen comparatively few actual instances of it being used as a day-to-day money. Of course, there are exceptions. I've been living un-banked off of crypto since 2016. But the fact that people still disbelieve me when I tell them this is a sign that “peer-to-peer electronic cash system” is still very much more a theoretical concept than a present-day reality.",
  //   },
  //   {
  //     articleType: {
  //       content: "image",
  //       status: "locked",
  //     },
  //     img: cardUserImgPlaceholder,
  //     metadata: "APR 16, 2021 AT 5:36 PM",
  //     title: "Just another day hard at work on the job.",
  //     image: imagePlaceholder,
  //   },
  // ];


  return (
    <div className="flex-1 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <>loading...</>
        </div>
      ) : content.length > 0 ? (
        content.map((item: any, index: number) => {
          if (item.articleType.content === "video") {
            return <VideoArticle content={item} key={index} />;
          } else if (item.articleType.content === "audio") {
            return <AudioArticle content={item} key={index} />;
          } else if (item.articleType.content === "text") {
            return <TextArticle content={item} key={index} />;
          } else if (item.articleType.content === "image") {
            return <ImageArticle content={item} key={index} />;
          }
        })
      ) : (
        <div className="flex justify-center items-center h-96">
          <>No any article posted yet</>
        </div>
      )}
      <div className="">
      { content.length > 0&& <Pagination title="Posts" />}
      </div>
    </div>
  );
};
