import {Handle, HandleProps} from '@xyflow/react';
import {cn} from '@/lib/utils';

interface CustomHandleProps extends Omit<HandleProps, 'className'> {
	className?: string;
	variant?: 'default' | 'generic';
}

function CustomHandle({
	className,
	variant = 'default',
	...props
}: CustomHandleProps) {
	const base = 'border-none! rounded-full!';
	const variantClass =
		variant === 'generic'
			? 'size-2! bg-muted-foreground! hover:bg-foreground!'
			: 'size-3! bg-background! outline! outline-ring! hover:outline-foreground!';

	return <Handle {...props} className={cn(base, variantClass, className)} />;
}

export default CustomHandle;
