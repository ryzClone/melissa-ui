import RolesPermissionsSection from "../components/RolesPermissionsSection";

export default function RolesPermissionsPage() {
  return (
    <div className="role-permissions-page">
      <div className="role-permissions-page-top">
        <h1>Rollar va ruxsatlar</h1>
        <p>Rollar ro&apos;yxati va har bir rolga tegishli ruxsatlarni boshqaring</p>
      </div>

      <RolesPermissionsSection />
    </div>
  );
}
