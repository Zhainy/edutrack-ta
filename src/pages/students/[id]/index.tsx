import { useParams } from 'react-router-dom';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-100">Perfil de Estudiante</h1>
      <p className="mt-2 text-slate-400">ID: {id}</p>
    </div>
  );
}
