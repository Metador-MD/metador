<?php

namespace WhereGroup\CoreBundle\Component\Metadata;

use DateTime;
use Exception;
use RuntimeException;
use WhereGroup\CoreBundle\Component\Utils\ArrayParser;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\UserBundle\Component\UserInterface;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class PrepareMetadata
 * @package WhereGroup\CoreBundle\Component\Metadata
 */
class PrepareMetadata
{
    /**
     * @param Metadata $metadata
     * @param User $user
     * @param array $options
     * @param $userService
     * @return Metadata
     * @throws Exception
     */
    public static function prepareInsert(Metadata $metadata, User $user, array $options, $userService): Metadata
    {
        $date = new DateTime();
        $object = $metadata->getObject();

        $object['dateStamp'] = $date->format('Y-m-d');
        $object['_username'] = $user->getUsername();

        $object['_insert_user'] = $object['_username'];
        $object['_insert_time'] = $object['dateStamp'];
        $object['_update_user'] = $object['_username'];
        $object['_update_time'] = $object['dateStamp'];

        $metadata
            ->setInsertUser($user)
            ->setInsertTime($date->getTimestamp())
            ->setUpdateUser($user)
            ->setUpdateTime($date->getTimestamp())
            ->setDateStamp(new DateTime($object['dateStamp']))
            ->setObject($object)
        ;

        return self::prepare($metadata, $options, $userService);
    }

    /**
     * @param Metadata $metadata
     * @param User $user
     * @param array $options
     * @param $userService
     * @return Metadata
     * @throws Exception
     */
    public static function prepareUpdate(Metadata $metadata, User $user, array $options, $userService): Metadata
    {
        $date = new DateTime();
        $object = $metadata->getObject();

        $object['dateStamp'] = $date->format('Y-m-d');
        $object['_username'] = $user->getUsername();
        $object['_update_user'] = $object['_username'];
        $object['_update_time'] = $object['dateStamp'];

        $metadata
            ->setUpdateUser($user)
            ->setUpdateTime($date->getTimestamp())
            ->setDateStamp(new DateTime($object['dateStamp']))
            ->setObject($object)
        ;

        return self::prepare($metadata, $options, $userService);
    }

    /**
     * @param Metadata $metadata
     * @param array $options
     * @param UserInterface $userService
     * @return Metadata
     * @throws Exception
     */
    protected static function prepare(Metadata $metadata, array $options, $userService): Metadata
    {
        $p = $metadata->getObject();

        // Title
        $p['title'] = isset($p['title']) ? $p['title'] : '';
        $metadata->setTitle($p['title'] !== '' ? $p['title'] : 'noname');

        $p['abstract'] = isset($p['abstract']) ? $p['abstract'] : '';
        $metadata->setAbstract($p['abstract']);

        $p['hierarchyLevel'] = isset($p['hierarchyLevel']) ? $p['hierarchyLevel'] : '';
        $metadata->setHierarchyLevel($p['hierarchyLevel']);

        // Set date
        if (!empty($p['revisionDate'])) {
            $p['_date'] = $p['revisionDate'];
        } elseif (!empty($p['publicationDate'])) {
            $p['_date'] = $p['publicationDate'];
        } elseif (!empty($p['creationDate'])) {
            $p['_date'] = $p['creationDate'];
        } else {
            $p['_date'] = $p['dateStamp'];
        }

        $metadata->setDate(new DateTime($p['_date']));

        // Remove lock
        if (isset($p['_locked'])) {
            $p['_locked'] = (boolean)$p['_locked'];
        } elseif (isset($p['_remove_lock']) || !isset($p['_locked'])) {
            $p['_locked'] = false;
        }
        $metadata->setLocked($p['_locked']);

        // Set profile
        if (!is_null($options['profile'])) {
            $p['_profile'] = $options['profile'];
        }

        if (empty($p['_profile'])) {
            throw new RuntimeException("Profil in " . $p['_uuid'] . " nicht gefunden.");
        }

        $metadata->setProfile($p['_profile']);

        // Set source
        if (!is_null($options['source'])) {
            $p['_source'] = $options['source'];
        }

        if (empty($p['_source'])) {
            throw new RuntimeException("Datenquelle in " . $p['_uuid'] . " nicht gefunden.");
        }
        $metadata->setSource($p['_source']);


        // Set public
        $p['_public'] = !isset($p['_public']) ? 0 : (int)$p['_public'];
        if (!is_null($options['public'])) {
            $p['_public'] = (int)$options['public'];
        }
        $metadata->setPublic((int)$p['_public']);

        // Set groups
        $p['_groups'] = !isset($p['_groups']) || !is_array($p['_groups']) ? [] : $p['_groups'];


        if (isset($p['parentIdentifier'])) {
            $metadata->setParent($p['parentIdentifier']);
        }

        if (isset($p['topicCategory'])) {
            $metadata->setTopicCategory(implode(" ", $p['topicCategory']));
        }

        $metadata->setId($p['_uuid']);
        $metadata->setSearchfield(self::prepareSearchField($p));

        if (!empty($p['bbox'][0]['nLatitude']) && !empty($p['bbox'][0]['eLongitude'])
            && !empty($p['bbox'][0]['sLatitude']) && !empty($p['bbox'][0]['wLongitude'])) {
            $p['bbox'][0]['nLatitude']  = (float)$p['bbox'][0]['nLatitude'];
            $p['bbox'][0]['eLongitude'] = (float)$p['bbox'][0]['eLongitude'];
            $p['bbox'][0]['sLatitude']  = (float)$p['bbox'][0]['sLatitude'];
            $p['bbox'][0]['wLongitude'] = (float)$p['bbox'][0]['wLongitude'];
            $metadata->setBboxn($p['bbox'][0]['nLatitude']);
            $metadata->setBboxe($p['bbox'][0]['eLongitude']);
            $metadata->setBboxs($p['bbox'][0]['sLatitude']);
            $metadata->setBboxw($p['bbox'][0]['wLongitude']);
        }

        // Set groups
        $metadata->clearGroups();

        foreach ($p['_groups'] as $key => $name) {
            $group = $userService->getGroupByName($name);

            if (!$group) {
                unset($p['_groups'][$key]);
                continue;
            }

            $metadata->addGroups($group);
        }

        $metadata->setObject($p);

        return $metadata;
    }

    /**
     * @param $p
     * @return string
     */
    protected static function prepareSearchField($p)
    {
        $searchfield  = '';
        $fields = ['_searchfield', 'title', 'alternateTitle', 'abstract'];

        foreach ($fields as $field) {
            $value = ArrayParser::get($p, $field, '');

            if (is_array($value) && !empty($value)) {
                $temp = '';

                foreach ($value as $row) {
                    if (is_string($row) && !empty($row)) {
                        $temp .= ' ' . $row;
                    }
                }

                $value = trim($temp);
                unset($temp);
            }
            $searchfield .= trim($value);
        }

        if (isset($p['keyword'])) {
            foreach ($p['keyword'] as $value) {
                if (isset($value['value']) && !empty($value['value'])) {
                    foreach ($value['value'] as $keyword) {
                        $searchfield .= ' ' . strtolower($keyword);
                    }
                }
            }
        }

        $searchfield = trim($searchfield);

        return !empty($searchfield) ? $searchfield : 'noname';
    }
}
