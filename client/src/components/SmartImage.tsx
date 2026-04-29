import clsx from 'clsx';
import { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Drop-in замена `<img>`. Пока картинка грузится — анимированный шиммер-фон
 * (того же размера/формы что img). Когда `onLoad` сработал — фон снимается,
 * картинка плавно проявляется.
 *
 * Для ошибок (broken image) — фон тоже убираем, чтобы не дёргался впустую.
 */
export default function SmartImage({ className, src, alt, onLoad, onError, ...rest }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={(e) => { setLoaded(true); onError?.(e); }}
      className={clsx(
        className,
        'smart-img',
        loaded ? 'smart-img-loaded opacity-100' : 'smart-img-loading opacity-0',
      )}
      {...rest}
    />
  );
}
