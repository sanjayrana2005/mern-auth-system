import React, { useState } from 'react'

const Input = ({ leftIcon: LeftIcon, rightIcon, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false)

    const inputType = type === "password" ? (showPassword ? "text" : "password") : type

    return (
        <div className='relative mb-6'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <LeftIcon className="size-5 text-green-500" />
            </div>
            <input
                {...props}
                type={inputType}
                className={`w-full py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200  ${LeftIcon ? "pl-10" : "pl-3"} ${rightIcon ? "pr-10" : "pr-3"}`}
            />

            {/* right icon */}

            {Array.isArray(rightIcon) && rightIcon.length === 2 ? (
                <div
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                >
                    {showPassword ? (
                        React.createElement(rightIcon[1], { className: "size-5 text-green-500" })
                    ) : (
                        React.createElement(rightIcon[0], { className: "size-5 text-green-500" })
                    )}
                </div>
            ) : (
                rightIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {React.createElement(rightIcon, { className: "size-5 text-green-500" })}
                    </div>
                )
            )}
        </div>
    );
};

export default Input
