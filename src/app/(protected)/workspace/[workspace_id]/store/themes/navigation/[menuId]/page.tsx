'use client';

import MenuForm from '@/components/workspace/store/themes/menus/form/MenuForm';
import { useParams } from 'next/navigation';

export default function EditMenuPage() {
  const params = useParams();
  const menuId = params?.menuId as string;

  return <MenuForm menuId={menuId} />;
}
