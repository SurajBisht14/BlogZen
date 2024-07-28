function About() {
    return (
        <>
        <div className="overflow-y-scroll h-[87vh]">
            <div className="2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
                <div className="flex lg:flex-row flex-col lg:gap-8 sm:gap-10 gap-12">
                    <div className="w-full lg:w-6/12">
                        <h2 className="w-full font-bold lg:text-4xl text-3xl lg:leading-10 dark:text-white leading-9">Welcome to BlogZen: Your Platform for Sharing Thoughts and Stories</h2>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6">
                            At BlogZen, our mission is to create a space where everyone can express their ideas and experiences freely. We believe in the power of sharing personal stories, opinions, and creative content to foster a more connected and understanding community. Whether you're here to read, share, or connect with others, BlogZen is your platform to make your voice heard.  our vision is to empower everyone to share their unique perspectives and experiences with the world. We aim to provide a welcoming and inclusive platform where individuals can connect, express themselves, and be inspired by the diverse content shared by others. BlogZen to share their blogs and connect with like-minded individuals. Our platform is designed to support and showcase diverse voices and creative content.

                            User Participation

                            BlogZen celebrates the contributions of every user who shares their stories and engages with the community. Your participation helps make our platform richer and more dynamic Our goal is to foster a community where every voice is valued, and every story has a place. We are committed to making blogging accessible and enjoyable for everyone, and we look forward to seeing the amazing content that our users will create and share on BlogZen.. Join us in making blogging accessible and enjoyable for all!
                        </p>
                    </div>
                    <div className="w-full lg:w-6/12">
                        <img  src="/src/images/blogginImage.jpg" alt="people discussing on board" className=" w-full md:w-[450px] mx-auto" />
                    </div>
                </div>

                <div className="relative mt-[10px]">
                    <div className="grid sm:grid-cols-3 grid-cols-2 sm:gap-8 gap-4">
                        <div className="z-20 w-12 h-12 bg-gray-800 rounded-full flex justify-center items-center">
                            <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg1.svg"  alt="flag" />
                        </div>

                        <img className="z-20" src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg3.svg" alt="note" />

                        <img className="z-20 sm:block hidden w-12 bg-black rounded-[50%]" src="https://cdn.pixabay.com/photo/2017/06/09/23/22/avatar-2388584_1280.png"  alt="users" />
                    </div>
                    <hr className="z-10 absolute top-2/4 w-full bg-gray-200" />
                </div>
                <div className="grid sm:grid-cols-3 grid-cols-2 sm:gap-8 gap-4">
                    <div>
                        <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white mt-6">Founded</p>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6">BlogZen was created with the vision of providing a space where individuals can share their unique perspectives and personal stories. This project is a result of a passionate effort to make blogging accessible and enjoyable for everyone.</p>
                    </div>
                    <div>
                        <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white mt-6">Community Engagement</p>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6">We are proud of the vibrant community that has joined BlogZen to share their blogs and connect with like-minded individuals. Our platform is designed to support and showcase diverse voices and creative content.</p>
                    </div>
                    <div className="sm:block hidden">
                        <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white mt-6">User Participation</p>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6">BlogZen celebrates the contributions of every user who shares their stories and engages with the community. Your participation helps make our platform richer and more dynamic.</p>
                    </div>
                </div>
                <div className="sm:hidden block relative mt-8">
                    <div className="grid sm:grid-cols-3 grid-cols-2 sm:gap-8 gap-4">
                        <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg3.svg" alt="user" />
                    </div>
                    <hr className="z-10 absolute top-2/4 w-full hidden bg-gray-200" />
                </div>
                <div className="sm:hidden grid sm:grid-cols-3 grid-cols-2 sm:gap-8 gap-4">
                    <div>
                        <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white mt-6">User Participation</p>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6">BlogZen celebrates the contributions of every user who shares their stories and engages with the community. Your participation helps make our platform richer and more dynamic.</p>
                    </div>
                </div>

                <div className="flex lg:flex-row flex-col md:gap-14 gap-16 justify-between lg:mt-20 mt-16">
                    <div className="w-full lg:w-6/12">
                        <h2 className="font-bold lg:text-4xl text-3xl lg:leading-9 leading-7 text-gray-800 dark:text-white">Our Vision</h2>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 mt-6 w-full lg:w-10/12 xl:w-9/12">At BlogZen, our vision is to empower everyone to share their unique perspectives and experiences with the world. We aim to provide a welcoming and inclusive platform where individuals can connect, express themselves, and be inspired by the diverse content shared by others.</p>
                        <p className="font-normal text-base leading-6 text-gray-600 dark:text-gray-200 w-full lg:w-10/12 xl:w-9/12 mt-10">Our goal is to foster a community where every voice is valued, and every story has a place. We are committed to making blogging accessible and enjoyable for everyone, and we look forward to seeing the amazing content that our users will create and share on BlogZen.</p>
                    </div>
                    <div className="w-full lg:w-6/12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:gap-12 gap-10">
                            <div className="flex p-4 shadow-md">
                                <div className="mr-6">
                                    <img className="mr-6" src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg4.svg" alt="personal project" />
                                </div>
                                <div className="">
                                    <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white">Personal Project</p>
                                    <p className="mt-2 font-normal text-base leading-6 text-gray-600 dark:text-gray-200">BlogZen is a personal project aimed at creating a space where individuals can freely share their thoughts and experiences. This platform is a labor of love and a testament to the power of individual creativity.</p>
                                </div>
                            </div>

                            <div className="flex p-4 shadow-md">
                                <div className="mr-6">
                                    <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg5.svg" alt="blogging platform" />
                                </div>
                                <div className="">
                                    <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white">Blogging Platform</p>
                                    <p className="mt-2 font-normal text-base leading-6 text-gray-600 dark:text-gray-200">As a blogging platform, BlogZen provides tools and features to help users create, share, and discover engaging content. Our aim is to support a diverse range of voices and stories from around the world.</p>
                                </div>
                            </div>

                            <div className="flex p-4 shadow-md">
                                <div className="mr-6">
                                    <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/about-us-3-svg6.svg" alt="community" />
                                </div>
                                <div className="">
                                    <p className="font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 text-gray-800 dark:text-white">Community</p>
                                    <p className="mt-2 font-normal text-base leading-6 text-gray-600 dark:text-gray-200">We value the community of users who contribute to BlogZen by sharing their content and engaging with others. Your involvement helps us build a vibrant and dynamic platform for everyone.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}
export default About;