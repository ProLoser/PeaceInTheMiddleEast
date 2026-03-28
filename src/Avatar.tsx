import { User } from './Types';
import './Avatar.css';

export const PRAVATAR_URL = (uid: string) => `https://i.pravatar.cc/100?u=${uid}`;

export type AvatarProps = {
    user?: User;
}

export default function Avatar({ user }: AvatarProps) {
    const fallback = user?.emailHash
      ? `https://gravatar.com/avatar/${user.emailHash}?s=100&d=retro`
      : `https://i.pravatar.cc/100?u=${user?.uid}`;
    return <img className="avatar"
      src={user ? user.photoURL || fallback : 'https://i.pravatar.cc/100'}
      alt={user?.name}
      draggable={false} />
}