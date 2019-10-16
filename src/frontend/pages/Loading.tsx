import React from "react";

interface LoadingProps {
    title: string;
}

const Loading: React.FC<LoadingProps> = (props) => {

    return (
        <div className="loading page" >
            <div className="popup-header">
                <div className="popup-header-title">
                    {props.title}
                </div>
            </div>
        </div>
    );
};

export default Loading;
