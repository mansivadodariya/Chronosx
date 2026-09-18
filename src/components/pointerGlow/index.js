'use client';
import React, { useEffect, useRef } from 'react';
import styles from './pointerGlow.module.scss';

/**
 * Reusable Cursor/Pointer Move Emerald Glow Component
 * Follows the user's mouse pointer with smooth 60fps interpolation.
 * Optimized to pause animation loop when mouse is stationary to save CPU/GPU.
 */
export default function PointerGlow({
    color = 'rgba(24, 201, 139, 0.35)',
    size = 560,
    contained = false,
    className = ''
}) {
    const glowRef = useRef(null);
    const posRef = useRef({ currentX: -1000, currentY: -1000, targetX: -1000, targetY: -1000, isVisible: false, isAnimating: false });
    const rafIdRef = useRef(null);

    useEffect(() => {
        const glowEl = glowRef.current;
        if (!glowEl) return;

        const animate = () => {
            const { currentX, currentY, targetX, targetY, isVisible } = posRef.current;

            const dx = targetX - currentX;
            const dy = targetY - currentY;

            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                posRef.current.currentX = targetX;
                posRef.current.currentY = targetY;
                if (glowEl && isVisible) {
                    glowEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
                }
                posRef.current.isAnimating = false;
                rafIdRef.current = null;
                return;
            }

            const ease = 0.14;
            const newX = currentX + dx * ease;
            const newY = currentY + dy * ease;

            posRef.current.currentX = newX;
            posRef.current.currentY = newY;

            if (glowEl && isVisible) {
                glowEl.style.transform = `translate3d(${newX}px, ${newY}px, 0) translate(-50%, -50%)`;
            }

            rafIdRef.current = requestAnimationFrame(animate);
        };

        const startAnimation = () => {
            if (!posRef.current.isAnimating) {
                posRef.current.isAnimating = true;
                if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = requestAnimationFrame(animate);
            }
        };

        const handlePointerMove = (e) => {
            let clientX = e.clientX;
            let clientY = e.clientY;

            if (contained && glowEl.parentElement) {
                const rect = glowEl.parentElement.getBoundingClientRect();
                clientX = e.clientX - rect.left;
                clientY = e.clientY - rect.top;
            }

            posRef.current.targetX = clientX;
            posRef.current.targetY = clientY;
            if (!posRef.current.isVisible) {
                posRef.current.isVisible = true;
                glowEl.style.opacity = '1';
            }
            startAnimation();
        };

        const handlePointerLeave = () => {
            posRef.current.isVisible = false;
            glowEl.style.opacity = '0';
        };

        const target = contained && glowEl.parentElement ? glowEl.parentElement : window;
        target.addEventListener('pointermove', handlePointerMove, { passive: true });
        target.addEventListener('pointerleave', handlePointerLeave, { passive: true });

        return () => {
            target.removeEventListener('pointermove', handlePointerMove);
            target.removeEventListener('pointerleave', handlePointerLeave);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [contained]);

    return (
        <div
            ref={glowRef}
            className={`${styles.pointerGlow} ${contained ? styles.contained : styles.global} ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle at center, ${color} 0%, rgba(24, 201, 139, 0.18) 32%, rgba(16, 185, 129, 0.05) 55%, transparent 72%)`
            }}
            aria-hidden="true"
        />
    );
}
