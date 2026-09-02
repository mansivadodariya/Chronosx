"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from './button.module.scss';
import classNames from 'classnames';

export default function Button({ text, icon, iconPosition = "right", onClick, btnmd, type = "button" }) {
    const renderIcon = () => {
        if (!icon) return null;
        if (typeof icon === 'string') {
            return <img src={icon} alt={text} />;
        }
        if (React.isValidElement(icon)) {
            return icon;
        }
        if (typeof icon === 'function') {
            const IconComponent = icon;
            return <IconComponent />;
        }
        return null;
    };

    return (
        <div className={classNames(styles.button, btnmd ? styles.btnmd : "")}>
            <motion.button
                type={type}
                onClick={onClick}
                aria-label={text}
                whileHover="hover"
                whileTap="tap"
                initial="rest"
                variants={{
                    rest: { scale: 1, boxShadow: "0 4px 20px rgba(24, 201, 139, 0.35)" },
                    hover: {
                        scale: 1.04,
                        boxShadow: "0 0 25px rgba(24, 201, 139, 0.7), 0 0 50px rgba(24, 201, 139, 0.4)",
                        transition: { type: "spring", stiffness: 400, damping: 15 }
                    },
                    tap: {
                        scale: 0.96,
                        transition: { duration: 0.1 }
                    }
                }}
            >
                {icon && iconPosition === "left" && (
                    <motion.span
                        className={styles.iconWrapper}
                        variants={{
                            rest: { x: 0 },
                            hover: { x: -3, transition: { type: "spring", stiffness: 400, damping: 15 } }
                        }}
                    >
                        {renderIcon()}
                    </motion.span>
                )}
                <span className={styles.btnText}>{text}</span>
                {icon && iconPosition !== "left" && (
                    <motion.span
                        className={styles.iconWrapper}
                        variants={{
                            rest: { x: 0 },
                            hover: { x: 4, transition: { type: "spring", stiffness: 400, damping: 15 } }
                        }}
                    >
                        {renderIcon()}
                    </motion.span>
                )}
            </motion.button>
        </div>
    );
}
