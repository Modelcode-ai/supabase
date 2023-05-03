import { useParams } from 'common/hooks'
import { RLS_ACKNOWLEDGED_KEY } from 'components/grid/constants'
import RLSDisableModalContent from 'components/interfaces/TableGridEditor/SidePanelEditor/TableEditor/RLSDisableModal'
import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import ConfirmationModal from 'components/ui/ConfirmationModal'
import { ENTITY_TYPE } from 'data/entity-types/entity-type-constants'
import { useTableQuery } from 'data/tables/table-query'
import useEntityType from 'hooks/misc/useEntityType'
import Link from 'next/link'
import { useState } from 'react'
import { Button, IconAlertCircle, Modal } from 'ui'

export default function RLSBannerWarning() {
  const { project } = useProjectContext()
  const { ref: projectRef, id: _id } = useParams()
  const tableID = _id ? Number(_id) : undefined

  const isAcknowledged =
    localStorage?.getItem(`${RLS_ACKNOWLEDGED_KEY}-${tableID}`) === 'true' ?? false

  const [isOpen, setIsOpen] = useState(false)

  const entityType = useEntityType(tableID)
  const { data: currentTable } = useTableQuery(
    {
      projectRef: project?.ref,
      connectionString: project?.connectionString,
      id: tableID,
    },
    {
      enabled: entityType?.type === ENTITY_TYPE.TABLE,
    }
  )

  const rlsEnabled = currentTable?.rls_enabled
  const isPublicTable = currentTable?.schema === 'public'

  function handleDismissWarning() {
    localStorage.setItem(`${RLS_ACKNOWLEDGED_KEY}-${tableID}`, 'true')
    setIsOpen(false)
  }

  return (
    <>
      {!isAcknowledged && !rlsEnabled && isPublicTable ? (
        <div>
          <div className="text-center bg-amber-500 text-amber-1100 dark:text-amber-900 text-xs py-2.5 flex items-center justify-center relative">
            <IconAlertCircle size={16} strokeWidth={2} />
            <span className="uppercase font-bold ml-2">Warning</span>: You are allowing anonymous
            access to your table.{' '}
            <Link href={`/project/${projectRef}/auth/policies?search=${tableID}`}>
              <a className="underline ml-2 opacity-80 hover:opacity-100 transition">
                Enable Row Level Security
              </a>
            </Link>
            <div className="ml-20 absolute right-2">
              <Button
                type="outline"
                className="hover:text-scale-1200 text-amber-900 dark:text-amber-900 border border-amber-800"
                onClick={() => setIsOpen(true)}
              >
                Dismiss
              </Button>
            </div>
          </div>

          <ConfirmationModal
            visible={isOpen}
            header="Turn off Row Level Security"
            buttonLabel="Confirm"
            size="medium"
            onSelectCancel={() => setIsOpen(false)}
            onSelectConfirm={handleDismissWarning}
          >
            <Modal.Content>
              <RLSDisableModalContent />
            </Modal.Content>
          </ConfirmationModal>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
