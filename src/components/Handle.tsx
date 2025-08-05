import {Handle, HandleProps} from '@xyflow/react';
import {cn} from '@/lib/utils';

interface CustomHandleProps extends Omit<HandleProps, 'className'> {
	className?: string;
}

function CustomHandle({className, ...props}: CustomHandleProps) {
	return (
		<Handle
			{...props}
			className={cn(
				'w-3! h-3! bg-background! outline! outline-ring! border-none! hover:outline-foreground!',
				className
			)}
		/>
	);
}

export default CustomHandle;
