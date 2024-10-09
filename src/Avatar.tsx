import { UserData } from './Types';
import './Avatar.css';

export type AvatarProps = {
    user?: UserData;
}

export default function Avatar({ user }: AvatarProps) {
    return <img className="avatar" src={user ? user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}` : 'https://i.pravatar.cc/100'} alt={user?.name} />
}