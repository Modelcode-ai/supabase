import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import { useFlag, useStore, withAuth } from 'hooks'
import ProjectLayout from '../'
import ProductMenu from 'components/ui/ProductMenu'
import { generateDatabaseMenu } from './DatabaseMenu.utils'
import { IS_PLATFORM } from 'lib/constants'

interface Props {
  title?: string
  children: ReactNode
}

const DatabaseLayout: FC<Props> = ({ title, children }) => {
  const { meta, ui, vault, backups } = useStore()
  const project = ui.selectedProject

  const router = useRouter()
  const page = router.pathname.split('/')[4]

  const vaultExtension = meta.extensions.byId('supabase_vault')
  const isVaultEnabled = vaultExtension !== undefined && vaultExtension.installed_version !== null
  const foreignDataWrappersEnabled = useFlag('foreignDataWrappers')

  useEffect(() => {
    if (ui.selectedProject?.ref) {
      meta.roles.load()
      meta.triggers.load()
      meta.extensions.load()
      meta.publications.load()

      if (IS_PLATFORM) {
        backups.load()
      }
    }
  }, [ui.selectedProject?.ref])

  useEffect(() => {
    if (isVaultEnabled) {
      vault.load()
    }
  }, [ui.selectedProject?.ref, isVaultEnabled])

  return (
    <ProjectLayout
      product="Database"
      productMenu={
        <ProductMenu page={page} menu={generateDatabaseMenu(project, foreignDataWrappersEnabled)} />
      }
    >
      <main style={{ maxHeight: '100vh' }} className="flex-1 overflow-y-auto">
        {children}
      </main>
    </ProjectLayout>
  )
}

export default withAuth(observer(DatabaseLayout))
