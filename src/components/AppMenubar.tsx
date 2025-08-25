import {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarSub,
	MenubarSubTrigger,
	MenubarSubContent,
	MenubarRadioGroup,
	MenubarRadioItem,
} from '@/components/ui/menubar';
import {useTheme} from '@/hooks/use-theme';

export default function AppMenubar() {
	const {theme, setTheme} = useTheme();

	return (
		<div className='absolute top-6 left-6 z-10'>
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>Settings</MenubarTrigger>
					<MenubarContent>
						<MenubarSub>
							<MenubarSubTrigger>Theme</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarRadioGroup
									value={theme}
									onValueChange={(value) =>
										setTheme(value as 'light' | 'dark' | 'system')
									}
								>
									<MenubarRadioItem value='light'>Light</MenubarRadioItem>
									<MenubarRadioItem value='dark'>Dark</MenubarRadioItem>
									<MenubarRadioItem value='system'>System</MenubarRadioItem>
								</MenubarRadioGroup>
							</MenubarSubContent>
						</MenubarSub>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		</div>
	);
}
