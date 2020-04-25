import * as os from 'os';
import * as path from 'path';
import * as process from 'process';
import * as vscode from 'vscode';

const DefaultTimeout = 3;

export type AuthenticationMethod = 'agent' | 'keyFile';

export function getConfig<T>(name: string, defaultValue: T): T {
	const config = vscode.workspace.getConfiguration('remoteX11');
	return config.get(name, defaultValue);
}

export function getDisplay() {
	return getConfig('display', 0);
}

export function getScreen() {
	return getConfig('screen', 0);
}

export function getAuthenticationMethod() {
	return getConfig<AuthenticationMethod>('SSH.authenticationMethod', 'keyFile');
}

export function getAgent() {
	return getConfig('SSH.agent', '') || getDefaultAgent();
}

export function getPrivateKey() {
	return resolveHome(getConfig('SSH.privateKey', '~/.ssh/id_rsa'));
}

export function getTimeout() {
	return getConfig('SSH.timeout', DefaultTimeout);
}

function getDefaultAgent() {
	if (os.platform() === 'win32') {
		return '\\\\.\\pipe\\openssh-ssh-agent';
	} else {
		const socket = process.env['SSH_AUTH_SOCK'];

		if (socket === undefined) {
			throw new Error('Cannot find SSH Agent. SSH_AUTH_SOCK environment variable is not set.');
		}

		return socket;
	}
}

function resolveHome(file: string) {
	if (file === '~') {
		return os.homedir();
	}

	if (file.startsWith('~/') || file.startsWith('~\\')) {
		return path.join(os.homedir(), file.slice(2));
	}

	return file;
}
