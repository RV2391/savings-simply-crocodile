interface FormHeaderProps {
  title: string;
  description: string;
}

export const FormHeader = ({ title, description }: FormHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-2xl font-semibold text-white">
        {title}
      </h3>
      <p className="text-lg text-muted-foreground">
        {description}
      </p>
    </div>
  );
};