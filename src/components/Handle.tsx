import {Handle, HandleProps} from '@xyflow/react';
import {cn} from '@/lib/utils';
import {motion} from 'motion/react';

interface CustomHandleProps extends Omit<HandleProps, 'className'> {
	className?: string;
}

function CustomHandle({className, ...props}: CustomHandleProps) {
	return (
		<Handle
			{...props}
			className={cn(
				'border-none! size-6! flex items-center justify-center group bg-red-500/20!',
				className
			)}
		>
			<motion.div className='size-2! rounded-full! bg-muted-foreground/50! group-hover:bg-foreground! pointer-events-none' />
		</Handle>
	);
}

export default CustomHandle;
