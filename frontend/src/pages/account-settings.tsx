import { updateProfile } from "@firebase/auth";
import { useAuth } from "../context/authContext";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function AccountSettings(props: any) {
    const { getWallet, connectWallet } = useAuth();
    const [username, setUsername] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [error, setError] = useState("");
    const { getUser } = useAuth();
    const hiddenFileInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // if(getUser().photoURL) {
        //   setSelectedImage(getUser().photoURL)
        // }
        console.log(getUser());
    }, []);
    const handleUsername = (username: string) => {
        setUsername(username);
    };

    const handleFileClick = () => {
        hiddenFileInput.current && hiddenFileInput.current.click();
    };

    const handleProfileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        console.log("profile upload");
        if (event.target.files) {
            setSelectedImage(event.target.files[0]);
        }
    };

    const handleSubmit = () => {

        // case where user updates image
        if (selectedImage) {
            const storage = getStorage();
            const profileRef = ref(
                storage,
                `user/${getUser().uid}/profile_img`
            );
            uploadBytes(profileRef, selectedImage);
            // no error catching for now, need to update
            getDownloadURL(profileRef).then((url) => {
                updateProfile(getUser(), {
                    displayName: username ? username : getUser().displayName,
                    photoURL: url,
                }).catch((error: Error) => {
                    console.log(error);
                });
            });
        } 
        // non image profile update
        // for now, just update displayName
        else {
            updateProfile(getUser(), {
                displayName: username,
            }).catch((error: Error) => {
                console.log(error);
            });
        }
    };

    const connectWalletHandler = async () => {
        connectWallet().catch((err: Error) => {
            setError(err.message);
        });
    };

    return (
        <div className="m-4 w-90">
            <div className="flex flex-col items-center justify-center p-8 m-2 ">
                <div className="text-xl block uppercase font-bold">
                    Account Settings
                </div>
                <div className="flex ">
                    <div className="">
                        {" "}
                        <div className="w-full px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                UserName
                            </label>
                            <input
                                className="appearance-none block w-full bg-stone-200 text-stone-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                id="grid-first-name"
                                type="text"
                                placeholder={getUser().displayName}
                                onChange={(e) => handleUsername(e.target.value)}
                            />
                        </div>
                        <div className="w-full px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Bio
                            </label>
                            <input
                                className="appearance-none block w-full bg-stone-200 text-stone-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                id="grid-first-name"
                                type="text"
                                // placeholder={getUser().displayName}
                                // onChange={(e) => handleUsername(e.target.value)}
                            />
                        </div>
                        {getWallet() ? (
                            <div className="w-full px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                    Wallet Address
                                </label>
                                <div
                                    className="cursor-not-allowed appearance-none block w-full bg-stone-200 text-stone-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white outline outline-mblue"
                                    id="grid-first-name"
                                >
                                    {getWallet()}{" "}
                                </div>
                            </div>
                        ) : (
                            <div className="my-4">
                                <button
                                    className="button-ghost"
                                    onClick={() => connectWalletHandler()}
                                >
                                    Connect Metamask Wallet
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Profile Photo
                        </label>
                        <button
                            onClick={handleFileClick}
                            className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2 px-4 rounded inline-flex items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 pr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            <span>Upload</span>
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={hiddenFileInput}
                            onChange={(e) => handleProfileUpload(e)}
                            style={{ display: "none" }}
                        />
                        {selectedImage && (
                            <div>
                                <img
                                    alt="not found"
                                    className="w-64 rounded mt-1"
                                    src={URL.createObjectURL(selectedImage)}
                                />
                                <br />
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className="button-primary"
                    onClick={() => handleSubmit()}
                >
                    Save Changes{" "}
                </button>
                <div className="error text-red-500 my-2">{error}</div>
            </div>
        </div>
    );
}

export default AccountSettings;
