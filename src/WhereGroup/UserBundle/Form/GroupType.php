<?php

namespace WhereGroup\UserBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class GroupType
 * @package WhereGroup\UserBundle\Form
 */
class GroupType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('role', 'text', array('label' => 'Gruppe'))
            ->add('description', 'textarea', array(
                'label'    => 'Beschreibung',
                'required' => false
            ))
            ->add(
                'users',
                'entity',
                array(
                    'class'        =>  'WhereGroupUserBundle:User',
                    'multiple'     => true,
                    'choice_label' => 'username',
                    'label'        => 'Benutzer',
                    'required'     => false
                )
            );
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'WhereGroup\UserBundle\Entity\Group'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'wheregroup_userbundle_grouptype';
    }
}
