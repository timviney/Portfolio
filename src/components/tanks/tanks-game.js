/* global createUnityInstance */
import React, { useEffect, useState, useRef } from 'react';

const TanksGame = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const unityInstanceRef = useRef(null);
    const isMountedRef = useRef(true);

    // Loading spinner component
    const loadingSpinner = (
        <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    // Error box component
    const errorBox = error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full md:w-1/2">
            <span className="block sm:inline">{error}</span>
            <button
                onClick={() => setError('')}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Close</title>
                    <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
                </svg>
            </button>
        </div>
    );

    useEffect(() => {
        // Initialize Unity when component mounts
        const initUnity = () => {
            const canvas = document.querySelector("#unity-canvas");

            if (!canvas) return;

            const buildUrl = "/tanks/Build";
            const loaderUrl = buildUrl + "/tanks.loader.js";

            const config = {
                dataUrl: buildUrl + "/tanks.data.gz",
                frameworkUrl: buildUrl + "/tanks.framework.js.gz",
                codeUrl: buildUrl + "/tanks.wasm.gz",
                streamingAssetsUrl: "StreamingAssets",
                companyName: "DefaultCompany",
                productName: "Tanks",
                productVersion: "1.0",
                webglContextAttributes: {
                    preferLowPowerToHighPerformance: true,
                    antialias: false
                  },
                  devicePixelRatio: 1 // Prevent HiDPI rendering
            };

            const script = document.createElement("script");
            script.src = loaderUrl;

            script.onload = () => {
                if (!isMountedRef.current) return;

                createUnityInstance(canvas, config, (progress) => {
                    console.log(`Loading progress: ${progress}`);
                  }).then((instance) => {
                    console.log("Unity initialized successfully");
                    // Add test rendering
                    instance.SendMessage('YourGameObject', 'YourTestFunction');
                  }).catch((error) => {
                    console.error("Unity init failed:", error);
                }).then((instance) => {
                    if (!isMountedRef.current) return;
                    unityInstanceRef.current = instance;
                    setIsLoading(false);
                    const loadingBar = document.querySelector("#unity-loading-bar");
                    if (loadingBar) {
                        loadingBar.style.display = "none";
                    }
                }).catch((error) => {
                    setError("Unity initialization failed: " + error.message);
                    setIsLoading(false);
                });
            };

            script.onerror = () => {
                setError("Failed to load Unity loader script");
                setIsLoading(false);
            };

            document.body.appendChild(script);

            return () => {
                isMountedRef.current = false;
                if (unityInstanceRef.current) {
                    unityInstanceRef.current.Quit().then(() => {
                        unityInstanceRef.current = null;
                    });
                }
                // Cleanup canvas
                const canvas = document.querySelector("#unity-canvas");
                if (canvas) canvas.remove();
            };
        };

        initUnity();
    }, []);
    const handleFullscreen = () => {
        const canvas = document.getElementById('unity-canvas');
        if (canvas?.requestFullscreen) {
          canvas.requestFullscreen();
        } else if (canvas?.webkitRequestFullScreen) {
          canvas.webkitRequestFullScreen(); // Safari
        } else if (canvas?.mozRequestFullScreen) {
          canvas.mozRequestFullScreen(); // Firefox
        } else if (canvas?.msRequestFullscreen) {
          canvas.msRequestFullscreen(); // IE/Edge
        }
      };

    return (
        <section className="w-full py-20 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8">Tanks Game</h1>
            {errorBox}

            <div id="unity-container" className="unity-desktop relative">
                <canvas id="unity-canvas" width="960" height="540" aspect-ratio="16/9" tabIndex="-1"></canvas>
                {isLoading && (
                    <div id="unity-loading-bar" className="block">
                        <div id="unity-logo"></div>
                        <div id="unity-progress-bar-empty">
                            <div id="unity-progress-bar-full"></div>
                        </div>
                    </div>
                )}
                <div id="unity-warning"></div>
                <div id="unity-footer" className={`${isLoading ? 'hidden' : ''}`}>
                    <div id="unity-logo-title-footer"></div>
                    <div id="unity-fullscreen-button" className="cursor-pointer"></div>
                    <div id="unity-build-title">Tanks game made with Unity and C#. 8 levels of increasing difficulty with enemy AI growing more sophisticated.</div>
                </div>
            </div>

            <div className="flex space-x-4 mt-8">
                <button
                    onClick={handleFullscreen}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-32 flex items-center justify-center"
                    disabled={isLoading}
                >
                    Fullscreen
                </button>
            </div>

            {isLoading && (
                <div className="mt-4 flex items-center">
                    {loadingSpinner}
                    <span className="ml-2">Loading game...</span>
                </div>
            )}
        </section>
    );
};

export default TanksGame;