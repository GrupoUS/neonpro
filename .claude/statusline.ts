import { StatusLineConfig } from '@claude-code/statusline';

export const statusLineConfig: StatusLineConfig = {
  enabled: true,
  position: 'bottom',
  segments: [
    {
      type: 'model',
      prefix: '🤖 ',
      suffix: '',
      color: 'green'
    },
    {
      type: 'working_directory',
      prefix: '📁 ',
      suffix: '',
      color: 'yellow'
    },
    {
      type: 'git_branch',
      prefix: '🌿 ',
      suffix: '',
      color: 'orange'
    },
    {
      type: 'git_status',
      prefix: '(',
      suffix: ')',
      color: 'cyan'
    }
  ],
  separator: ' | ',
  background: '#1e1e1e',
  foreground: '#ffffff'
};

// Export the configuration for Claude Code to use
export default statusLineConfig;