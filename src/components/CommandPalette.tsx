import {useEffect, useMemo, useState} from 'react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@/components/ui/command';

type Command = {
	id: string;
	label: string;
	action: () => void;
};

export default function CommandPalette({
	isOpen,
	onClose,
	commands,
}: {
	isOpen: boolean;
	onClose: () => void;
	commands: Command[];
}) {
	const [query, setQuery] = useState('');
	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		return commands.filter((c) => c.label.toLowerCase().includes(q));
	}, [commands, query]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	// Clear the query on open to avoid carrying any initial keystroke
	useEffect(() => {
		if (isOpen) setQuery('');
	}, [isOpen]);

	if (!isOpen) return null;
	return (
		<div className='fixed inset-0 z-50 flex items-start justify-center pt-24'>
			<div className='absolute inset-0 bg-black/40' onClick={onClose} />
			<div className='relative w-full max-w-lg rounded-lg border border-border bg-card shadow-xl'>
				<Command className='rounded-lg border shadow-md'>
					<CommandInput
						autoFocus
						value={query}
						onValueChange={setQuery}
						placeholder='Type a command or search...'
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading='Commands'>
							{filtered.map((cmd) => (
								<CommandItem
									key={cmd.id}
									onSelect={() => {
										cmd.action();
										onClose();
									}}
								>
									<span>{cmd.label}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading='Shortcuts'>
							<CommandItem disabled>
								<span>New Box</span>
								<CommandShortcut>N</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</div>
		</div>
	);
}
