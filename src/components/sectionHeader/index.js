"use client";
import React from 'react';
import classNames from 'classnames';
import Textbutton from '@/components/textbutton';
import styles from './sectionHeader.module.scss';

export default function SectionHeader({
  badge,
  title1,
  title2,
  title,
  breakLine = true,
  description,
  desc,
  align = 'center',
  className = '',
  descMaxWidth,
  children,
  action,
  as,
  asTag,
  headingTag,
}) {
  const descriptionContent = description || desc || children;

  const alignClass = {
    center: styles.alignCenter,
    left: styles.alignLeft,
    right: styles.alignRight,
    split: styles.alignSplit
  }[align] || styles.alignCenter;

  const renderBadge = () => {
    if (!badge || (typeof badge === 'string' && !badge.trim())) return null;
    if (typeof badge === 'string') {
      return (
        <div className={styles.badgeWrapper}>
          <Textbutton text={badge} />
        </div>
      );
    }
    return <div className={styles.badgeWrapper}>{badge}</div>;
  };

  const renderTitle = () => {
    const Tag = as || asTag || headingTag || 'h2';
    if (title) {
      return <Tag className={styles.title}>{title}</Tag>;
    }

    return (
      <Tag className={styles.title}>
        {title1 && <span className={styles.title1}>{title1}</span>}
        {title1 && title2 && breakLine && <br />}
        {title1 && title2 && !breakLine && ' '}
        {title2 && <span className={styles.title2}>{title2}</span>}
      </Tag>
    );
  };

  const renderDescription = () => {
    if (!descriptionContent) return null;
    return (
      <p
        className={styles.description}
        style={descMaxWidth ? { maxWidth: descMaxWidth } : undefined}
      >
        {descriptionContent}
      </p>
    );
  };

  if (align === 'split') {
    return (
      <div className={classNames(styles.sectionHeaderWrapper, alignClass, className)}>
        <div className={styles.splitLayout}>
          <div className={styles.titleColumn}>
            {renderBadge()}
            {renderTitle()}
          </div>
          <div className={styles.descColumn}>
            {renderDescription()}
            {action && <div className={styles.actionWrapper}>{action}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.sectionHeaderWrapper, alignClass, className)}>
      {renderBadge()}
      {renderTitle()}
      {renderDescription()}
      {action && <div className={styles.actionWrapper}>{action}</div>}
    </div>
  );
}
